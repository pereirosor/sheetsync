export function diceTierColor(diceSum?: number, diceMax?: number): string {
  if (diceMax == null || diceMax <= 0 || diceSum == null) return 'var(--text)';
  const pct = (diceSum / diceMax) * 100;
  if (pct <= 25) return 'var(--danger)';
  if (pct <= 50) return 'var(--warning)';
  if (pct <= 75) return 'var(--gold)';
  return 'var(--success)';
}
