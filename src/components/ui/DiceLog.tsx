import type { DiceRollEntry } from '../../types';
import { diceTierColor } from '../../utils/diceColor';

interface Props {
  entries: DiceRollEntry[];
}

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
          <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {timeStr(e.timestamp)}
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 600, flexShrink: 0 }}>{e.rollerName}</span>
            <span style={{ color: 'var(--text2)', flexShrink: 0 }}>{e.label}:</span>
            <span style={{ color: 'var(--text2)', fontSize: 11, flexShrink: 0 }}>{e.breakdown}</span>
            <span style={{ color: 'var(--text2)', flexShrink: 0 }}>=</span>
            <strong style={{ color: diceTierColor(e.diceSum, e.diceMax), flexShrink: 0 }}>
              {e.total}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
