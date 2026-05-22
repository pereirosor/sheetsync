import { useState } from 'react';
import { useStore } from '../../store';
import { rollSimpleFormula } from '../../utils/dice';

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;

type Mode = 'public' | 'private';

interface LastResult {
  label: string;
  breakdown: string;
  total: number;
  mode: Mode;
}

export default function GMDiceRoller() {
  const [formula, setFormula] = useState('');
  const [mode, setMode] = useState<Mode>('public');
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const rollDice = useStore((s) => s.rollDice);
  const rollerName = useStore((s) => s.currentPlayerName) ?? 'Mestre';

  function emit(label: string, breakdown: string, total: number) {
    setLastResult({ label, breakdown, total, mode });
    if (mode === 'public') {
      rollDice({ rollerName, label, diceExpr: label, breakdown, total });
    }
  }

  function quickRoll(sides: number) {
    const value = Math.floor(Math.random() * sides) + 1;
    emit(`d${sides}`, `[${value}]`, value);
  }

  function rollFormula() {
    const result = rollSimpleFormula(formula);
    if (!result) return;
    emit(formula.trim(), result.breakdown, result.total);
  }

  return (
    <div className="dice-panel" style={{ padding: 0, gap: 10 }}>
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'public' ? 'active' : ''}`}
          onClick={() => setMode('public')}
        >
          Público
        </button>
        <button
          className={`mode-btn ${mode === 'private' ? 'active' : ''}`}
          onClick={() => setMode('private')}
        >
          🔒 Privado
        </button>
      </div>

      <div className="dice-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {DICE.map((sides) => (
          <button key={sides} className="die-btn" onClick={() => quickRoll(sides)}>
            d{sides}
          </button>
        ))}
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

      <div className="roll-result-box" style={{ minHeight: 56 }}>
        {lastResult ? (
          <>
            <div className="roll-total">{lastResult.total}</div>
            <div className="roll-detail">
              {lastResult.mode === 'private' && '🔒 '}
              {lastResult.label} = {lastResult.breakdown} = {lastResult.total}
            </div>
          </>
        ) : (
          <div className="roll-detail">Role um dado ou digite uma fórmula</div>
        )}
      </div>
    </div>
  );
}
