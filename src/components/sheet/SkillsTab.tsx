import { useStore } from '../../store';
import tormenta20, { skillTotal } from '../../systems/tormenta20';

interface Props {
  characterName: string;
}

const ATTR_ABBR: Record<string, string> = {
  strength: 'FOR',
  dexterity: 'DES',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'SAB',
  charisma: 'CAR',
};

export default function SkillsTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  const toggleSkill = (id: string) => {
    updateCharacter(characterName, {
      skills: { ...char.skills, [id]: !char.skills[id] },
    });
  };

  return (
    <div>
      <p className="sec-title">Perícias</p>
      <table className="skills-table w-full">
        <thead>
          <tr>
            <th style={{ width: 28, textAlign: 'center', color: 'var(--text2)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', paddingBottom: 6 }}>T</th>
            <th style={{ textAlign: 'left', color: 'var(--text2)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', paddingBottom: 6 }}>Perícia</th>
            <th style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', paddingBottom: 6 }}>Atributo</th>
            <th style={{ textAlign: 'right', color: 'var(--text2)', fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase', paddingBottom: 6 }}>Bônus</th>
          </tr>
        </thead>
        <tbody>
          {tormenta20.skillList.map((skill) => {
            const trained = char.skills[skill.id] ?? false;
            const attrVal = char.attributes[skill.attribute];
            const total = skillTotal(attrVal, trained, char.level);
            return (
              <tr key={skill.id}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={trained}
                    onChange={() => toggleSkill(skill.id)}
                  />
                </td>
                <td>
                  <span className="skill-name">{skill.name}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="skill-attr">{ATTR_ABBR[skill.attribute]}</span>
                </td>
                <td className="skill-bonus">
                  {total >= 0 ? '+' : ''}{total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
        T = Treinado · Bônus = Mod. Atributo + (treinado: 4 + ½ nível)
      </p>
    </div>
  );
}
