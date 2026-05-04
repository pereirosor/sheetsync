interface BadgeProps {
  label: string;
  value: string | number;
  color?: string;
}

export default function Badge({ label, value, color }: BadgeProps) {
  return (
    <span className="badge">
      <span style={{ color: color ?? 'var(--text2)' }}>{label}</span>
      <strong>{value}</strong>
    </span>
  );
}
