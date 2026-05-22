import tormenta20 from '../../../systems/tormenta20';
import type { Character } from '../../../types';

interface Props {
  char: Character;
  newLevel: number;
}

export default function FixedFeaturesStep({ char, newLevel }: Props) {
  const cd = tormenta20.classData[char.class];
  const progression = tormenta20.classProgression[char.class];

  if (!cd || !progression) {
    return <p style={{ color: 'var(--text2)', fontSize: 13 }}>Classe não reconhecida.</p>;
  }

  const levelFeatures = progression[newLevel - 1] ?? [];
  const fixedFeatures = levelFeatures.filter(
    (f) => !/poder de/i.test(f) && !/magias \(/i.test(f)
  );
  const hasPowerChoice = levelFeatures.some((f) => /poder de/i.test(f));
  const newCircle = levelFeatures.find((f) => /magias \(/i.test(f));

  const getAbilityDesc = (featureName: string) => {
    const norm = featureName.toLowerCase().replace(/\s+/g, ' ').trim();
    const match = cd.abilities.find(
      (a) => a.name.toLowerCase().replace(/\s+/g, ' ').trim() === norm ||
        norm.startsWith(a.name.toLowerCase())
    );
    return match?.description ?? null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        Habilidades que seu personagem recebe automaticamente ao atingir o nível {newLevel}.
      </p>

      {fixedFeatures.length === 0 && !newCircle && !hasPowerChoice && (
        <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>
          Nenhuma habilidade fixa neste nível.
        </p>
      )}

      {fixedFeatures.map((f) => {
        const desc = getAbilityDesc(f);
        return (
          <div key={f} className="lu-feature-card">
            <strong style={{ fontSize: 13, color: 'var(--gold)' }}>{f}</strong>
            {desc && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>{desc}</p>}
          </div>
        );
      })}

      {newCircle && (
        <div className="lu-feature-card" style={{ borderColor: 'var(--mana)' }}>
          <strong style={{ fontSize: 13, color: 'var(--mana)' }}>{newCircle}</strong>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            Você agora pode aprender e lançar magias de um círculo mais alto.
          </p>
        </div>
      )}

      {hasPowerChoice && (
        <div className="lu-feature-card" style={{ borderColor: 'var(--gold)', borderStyle: 'dashed' }}>
          <strong style={{ fontSize: 13, color: 'var(--gold)' }}>Poder de {char.class}</strong>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            Você pode escolher um poder geral ou de classe. O próximo passo permite escolher.
          </p>
        </div>
      )}
    </div>
  );
}
