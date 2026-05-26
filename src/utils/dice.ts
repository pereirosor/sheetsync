import tormenta20, { skillTotal } from '../systems/tormenta20';
import type { Character } from '../types';

export interface RollResult {
  total: number;
  breakdown: string;
  diceSum: number;
  diceMax: number;
}

// Pure dice + modifier roller (no skills/character). Produces breakdown like "[4, 5]+3".
export function rollSimpleFormula(expr: string): { breakdown: string; total: number; diceSum: number; diceMax: number } | null {
  const cleaned = expr.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleaned) return null;

  const tokens = cleaned.split(/(?=[+-])/);
  const parts: string[] = [];
  let total = 0;
  let diceSum = 0;
  let diceMax = 0;

  for (const token of tokens) {
    if (!token) continue;

    const diceMatch = token.match(/^([+-]?)(\d*)d(\d+)$/);
    if (diceMatch) {
      const sign = diceMatch[1] === '-' ? -1 : 1;
      const count = diceMatch[2] ? parseInt(diceMatch[2], 10) : 1;
      const sides = parseInt(diceMatch[3], 10);
      if (count < 1 || count > 100 || sides < 1) return null;
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      const rollsSum = rolls.reduce((a, b) => a + b, 0);
      total += sign * rollsSum;
      diceSum += rollsSum;
      diceMax += count * sides;
      const prefix = sign < 0 ? '-' : parts.length > 0 ? '+' : '';
      parts.push(`${prefix}[${rolls.join(', ')}]`);
      continue;
    }

    const numMatch = token.match(/^([+-]?\d+)$/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      total += n;
      parts.push(`${n >= 0 && parts.length > 0 ? '+' : ''}${n}`);
      continue;
    }

    return null;
  }

  return parts.length > 0 ? { breakdown: parts.join(''), total, diceSum, diceMax } : null;
}

export function evalDiceExpr(expr: string, char: Character): RollResult {
  const tokens = expr.split('+').map((t) => t.trim()).filter(Boolean);
  let total = 0;
  let diceSum = 0;
  let diceMax = 0;
  const parts: string[] = [];

  for (const token of tokens) {
    const diceMatch = token.match(/^(\d+)d(\d+)$/i);
    if (diceMatch) {
      const n = Math.min(parseInt(diceMatch[1], 10), 100);
      const m = parseInt(diceMatch[2], 10);
      const rolls: number[] = [];
      for (let i = 0; i < n; i++) rolls.push(Math.floor(Math.random() * m) + 1);
      const sum = rolls.reduce((a, b) => a + b, 0);
      total += sum;
      diceSum += sum;
      diceMax += n * m;
      parts.push(n === 1 ? `d${m}[${rolls[0]}]` : `${token}[${rolls.join(',')}]`);
      continue;
    }

    if (/^-?\d+$/.test(token)) {
      total += parseInt(token, 10);
      parts.push(token);
      continue;
    }

    const normalized = token.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const skillDef = tormenta20.skillList.find((s) => {
      const sNorm = s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const idNorm = s.id.toLowerCase();
      return sNorm === normalized || idNorm === normalized;
    });
    if (skillDef) {
      const attrVal = char.attributes[skillDef.attribute];
      const trained = char.skills[skillDef.id] ?? false;
      const mod = skillTotal(attrVal, trained, char.level);
      total += mod;
      parts.push(`${skillDef.name}(${mod >= 0 ? '+' : ''}${mod})`);
      continue;
    }

    parts.push(`?${token}`);
  }

  return { total, breakdown: parts.join('+'), diceSum, diceMax };
}
