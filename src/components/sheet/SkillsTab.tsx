import { useStore } from '../../store';
import tormenta20 from '../../systems/tormenta20';
import { getSkillBreakdown } from '../../utils/skillModifiers';

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

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

export default function SkillsTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const rollDice = useStore((s) => s.rollDice);

  if (!char) return null;

  const raceInfo = tormenta20.raceData[char.race];

  const handleRoll = (skillName: string, modifier: number) => {
    const result = rollDie(20);
    const total = result + modifier;
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    rollDice({
      rollerName: char.name || characterName,
      label: skillName,
      diceExpr: `1d20+${skillName}`,
      breakdown: `d20[${result}]${modStr}`,
      total,
      diceSum: result,
      diceMax: 20,
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
            <th style={{ width: 36 }} />
          </tr>
        </thead>
        <tbody>
          {tormenta20.skillList.map((skill) => {
            const trained = char.skills[skill.id] ?? false;
            const { base, others, total } = getSkillBreakdown(char, skill, raceInfo);
            const hasOthers = others.length > 0;
            const othersTotal = others.reduce((s, o) => s + o.value, 0);
            const othersTitle = others.map((o) => `${o.source}: ${o.value >= 0 ? '+' : ''}${o.value}`).join('\n');
            return (
              <tr key={skill.id}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={trained}
                    disabled
                    title="Treinamento vem da classe, origem e poderes escolhidos"
                    style={{ cursor: 'not-allowed', opacity: trained ? 1 : 0.4 }}
                    onChange={() => undefined}
                  />
                </td>
                <td>
                  <span className="skill-name">{skill.name}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="skill-attr">{ATTR_ABBR[skill.attribute]}</span>
                </td>
                <td className="skill-bonus" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {hasOthers ? (
                    <span title={othersTitle} style={{ cursor: 'help' }}>
                      <span style={{ color: 'var(--text2)', fontSize: 11 }}>
                        {base >= 0 ? '+' : ''}{base}
                        <span style={{ margin: '0 3px', color: 'var(--text3)' }}>·</span>
                        <span style={{ color: 'var(--gold)' }}>
                          Outros: {othersTotal >= 0 ? '+' : ''}{othersTotal}
                        </span>
                        <span style={{ margin: '0 3px', color: 'var(--text3)' }}>·</span>
                      </span>
                      <strong>Total: {total >= 0 ? '+' : ''}{total}</strong>
                    </span>
                  ) : (
                    <>{total >= 0 ? '+' : ''}{total}</>
                  )}
                </td>
                <td>
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => handleRoll(skill.name, total)}
                    title={`Rolar d20 + ${total >= 0 ? '+' : ''}${total}`}
                    style={{ padding: '2px 6px', fontSize: 13 }}
                  >
                    🎲
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
        T = Treinado (via classe, origem ou poder) · Bônus = Mod. Atributo + (treinado: 4 + ½ nível)
      </p>
    </div>
  );
}
