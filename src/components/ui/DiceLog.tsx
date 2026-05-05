import type { DiceRollEntry } from '../../types';

interface Props {
  entries: DiceRollEntry[];
}

const fmt = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

const timeStr = (ts: number): string => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function DiceLog({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <p className="sec-title" style={{ marginBottom: 10 }}>Rolagens da Sessão</p>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          maxHeight: 280,
          overflowY: 'auto',
        }}
      >
        {entries.map((e) => (
          <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 13 }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {timeStr(e.timestamp)}
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 600, flexShrink: 0 }}>{e.rollerName}</span>
            <span style={{ color: 'var(--text2)', flexShrink: 0 }}>{e.label}:</span>
            <span style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
              🎲{e.diceExpr}
              {e.modifier !== 0 && <span style={{ color: 'var(--text2)' }}>{fmt(e.modifier)}</span>}
              {' '}={' '}
              <strong style={{ color: e.total >= 15 ? 'var(--success)' : e.total <= 5 ? 'var(--danger)' : 'var(--text)' }}>
                {e.total}
              </strong>
              <span style={{ fontSize: 10, color: 'var(--text2)', marginLeft: 4 }}>
                ({e.result}{e.modifier !== 0 ? fmt(e.modifier) : ''})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
