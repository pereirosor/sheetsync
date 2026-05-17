import tormenta20 from '../systems/tormenta20';

export function resolveSkillId(benefitName: string): string | null {
  const direct = tormenta20.skillList.find((s) => s.name === benefitName);
  if (direct) return direct.id;
  if (benefitName.startsWith('Ofício')) return 'oficio';
  return null;
}
