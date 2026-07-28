import tormenta20 from '../systems/tormenta20';

export function resolveSkillId(benefitName: string): string | null {
  const direct = tormenta20.skillList.find((s) => s.name === benefitName);
  if (direct) return direct.id;
  if (benefitName.startsWith('Ofício')) return 'oficio';
  return null;
}

/**
 * Auditoria de dados em dev.
 *
 * Benefícios de origem são casados por nome EXATO: os que resolvem viram perícia
 * treinada, os demais são tratados como poder de origem. Não dá para exigir que
 * todo não-perícia seja um poder conhecido (poderes de origem não estão em
 * generalPowers), então procuramos a assinatura real do bug: um benefício que é
 * "quase" o nome de uma perícia — tipicamente uma variante entre parênteses,
 * como 'Conhecimento (Religioso)' quando a perícia se chama só 'Conhecimento'.
 * Foi assim que a origem Estudioso perdeu Conhecimento silenciosamente.
 */
if (import.meta.env.DEV) {
  const skillNames = tormenta20.skillList.map((s) => s.name);
  const baseName = (n: string) => n.replace(/\s*\(.*\)\s*$/, '').trim();
  const nearMisses = new Set<string>();

  for (const [origin, benefits] of Object.entries(tormenta20.originData)) {
    for (const b of benefits as string[]) {
      if (resolveSkillId(b)) continue;
      // Ofício(...) já é tratado acima; qualquer outro nome cuja raiz bata com
      // uma perícia é uma divergência de dados, não um poder.
      const root = baseName(b);
      if (skillNames.some((n) => baseName(n) === root)) {
        nearMisses.add(`${origin}: "${b}" — a perícia se chama "${root}"`);
      }
    }
  }

  if (nearMisses.size > 0) {
    console.warn(
      '[tormenta20] Benefícios de origem que quase batem com uma perícia e por isso ' +
        'são perdidos silenciosamente (corrija o nome em origins.ts ou skills.ts):\n  ' +
        [...nearMisses].join('\n  '),
    );
  }
}
