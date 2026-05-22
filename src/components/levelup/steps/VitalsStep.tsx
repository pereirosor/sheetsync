import tormenta20, { calcMod2 } from '../../../systems/tormenta20';
import type { Character } from '../../../types';

interface Props {
  char: Character;
  newLevel: number;
}

export default function VitalsStep({ char, newLevel }: Props) {
  const cd = tormenta20.classData[char.class];
  if (!cd) return <p style={{ color: 'var(--text2)', fontSize: 13 }}>Classe não reconhecida.</p>;

  const conMod = calcMod2(char.attributes.constitution);
  const hpGain = Math.max(1, cd.hpPerLevel + conMod);
  const newHpMax = char.vitals.hp.max + hpGain;
  const newManaMax = cd.mpPerLevel * newLevel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        Ao subir de nível seu personagem fica mais resistente. Estes valores são calculados
        automaticamente com base na sua classe e Constituição.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="lu-vital-row">
          <span className="lu-vital-label" style={{ color: 'var(--hp)' }}>Pontos de Vida</span>
          <div className="lu-vital-values">
            <span className="lu-vital-old">{char.vitals.hp.max}</span>
            <span className="lu-vital-arrow">→</span>
            <span className="lu-vital-new" style={{ color: 'var(--hp)' }}>{newHpMax}</span>
            <span className="lu-vital-gain">(+{hpGain})</span>
          </div>
          <p className="lu-vital-note">
            {cd.hpPerLevel} (classe) {conMod >= 0 ? `+${conMod}` : conMod} (Con){conMod + cd.hpPerLevel < 1 ? ', mínimo 1' : ''}
          </p>
        </div>

        {newManaMax > 0 && (
          <div className="lu-vital-row">
            <span className="lu-vital-label" style={{ color: 'var(--mana)' }}>Pontos de Mana</span>
            <div className="lu-vital-values">
              <span className="lu-vital-old">{char.vitals.mana.max}</span>
              <span className="lu-vital-arrow">→</span>
              <span className="lu-vital-new" style={{ color: 'var(--mana)' }}>{newManaMax}</span>
              <span className="lu-vital-gain">(+{cd.mpPerLevel}/nível)</span>
            </div>
            <p className="lu-vital-note">{cd.mpPerLevel} PM × Nível {newLevel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
