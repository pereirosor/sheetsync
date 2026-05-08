import { useState } from 'react';
import { useStore } from '../../store';
import DiceLog from '../ui/DiceLog';

function parseSimpleDice(expr: string): { total: number; breakdown: string } | null {
  const cleaned = expr.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleaned) return null;

  const tokens = cleaned.split(/(?=[+-])/);
  const parts: string[] = [];
  let total = 0;

  for (const token of tokens) {
    if (!token) continue;

    const diceMatch = token.match(/^([+-]?)(\d*)d(\d+)$/);
    if (diceMatch) {
      const sign = diceMatch[1] === '-' ? -1 : 1;
      const count = diceMatch[2] ? parseInt(diceMatch[2]) : 1;
      const sides = parseInt(diceMatch[3]);
      if (count < 1 || count > 100 || sides < 1) return null;
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
      const sum = rolls.reduce((a, b) => a + b, 0);
      total += sign * sum;
      const rollStr = rolls.length > 1 ? `(${rolls.join('+')}=${sum})` : `${sum}`;
      parts.push(`${sign < 0 ? '-' : parts.length > 0 ? '+' : ''}${rollStr}`);
      continue;
    }

    const numMatch = token.match(/^([+-]?\d+)$/);
    if (numMatch) {
      const n = parseInt(numMatch[1]);
      total += n;
      parts.push(`${n >= 0 && parts.length > 0 ? '+' : ''}${n}`);
      continue;
    }

    return null;
  }

  return parts.length > 0 ? { total, breakdown: parts.join('') } : null;
}

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;

export default function DiceRoller() {
  const [formula, setFormula] = useState('');
  const [lastResult, setLastResult] = useState<{ label: string; total: number; breakdown: string } | null>(null);

  const rollDice = useStore((s) => s.rollDice);
  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const diceLog = useStore((s) => s.diceLog);
  const rollerName = currentPlayerName ?? 'Jogador';

  function quickRoll(sides: number) {
    const value = Math.floor(Math.random() * sides) + 1;
    const entry = { label: `d${sides}`, diceExpr: `1d${sides}`, breakdown: `${value}`, total: value };
    setLastResult(entry);
    rollDice({ rollerName, ...entry });
  }

  function rollFormula() {
    const result = parseSimpleDice(formula);
    if (!result) return;
    const label = formula.trim();
    const entry = { label, diceExpr: label, breakdown: result.breakdown, total: result.total };
    setLastResult(entry);
    rollDice({ rollerName, ...entry });
  }

  return (
    <div className="dice-panel">
      <p className="dice-panel-title">Rolador de Dados</p>

      <div className="dice-grid">
        {DICE.map((sides) => (
          <button key={sides} className="die-btn" onClick={() => quickRoll(sides)}>
            d{sides}
          </button>
        ))}
      </div>

      <div className="roll-result-box">
        {lastResult ? (
          <>
            <div className="roll-total">{lastResult.total}</div>
            <div className="roll-detail">
              {lastResult.label} · {lastResult.breakdown}
            </div>
          </>
        ) : (
          <div className="roll-detail">Clique em um dado para rolar</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="2d6+3"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && rollFormula()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-secondary btn-sm" onClick={rollFormula}>
          Rolar
        </button>
      </div>

      {diceLog.length > 0 ? (
        <DiceLog entries={diceLog} />
      ) : (
        <p className="roll-detail" style={{ textAlign: 'center', padding: '16px 0' }}>
          Sem rolagens na sessão
        </p>
      )}
    </div>
  );
}
