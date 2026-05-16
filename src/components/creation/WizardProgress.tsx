interface Props {
  current: number;
  total: number;
  label: string;
}

export default function WizardProgress({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{current}/{total}</span>
      </div>
      <div style={{ height: 4, background: 'var(--bg-card2)', borderRadius: 2 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--gold)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
