import tormenta20, { skillTotal } from '../systems/tormenta20';
import type { Character } from '../types';

export interface RollResult {
  total: number;
  breakdown: string;
}

export function evalDiceExpr(expr: string, char: Character): RollResult {
  const tokens = expr.split('+').map((t) => t.trim()).filter(Boolean);
  let total = 0;
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

  return { total, breakdown: parts.join('+') };
}
