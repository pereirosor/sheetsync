interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
}

export default function ProgressBar({ label, current, max, color }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-label">
        <span style={{ color }}>{label}</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
