import { useStore } from '../../store';
import type { SpellItem } from '../../types';
import tormenta20, { skillTotal } from '../../systems/tormenta20';

interface Props {
  characterName: string;
}

const genId = () => Math.random().toString(36).slice(2, 9);
const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;

const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

const emptySpell = (): SpellItem => ({
  id: genId(),
  name: '',
  circleOrLevel: '',
  manaCost: 0,
  school: '',
  range: '',
  duration: '',
  description: '',
});

export default function SpellsTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);
  const rollDice = useStore((s) => s.rollDice);

  if (!char) return null;

  const setSpells = (spells: SpellItem[]) => updateCharacter(characterName, { spells });

  const addSpell = () => setSpells([...char.spells, emptySpell()]);

  const removeSpell = (id: string) => setSpells(char.spells.filter((s) => s.id !== id));

  const updateSpell = (id: string, field: keyof SpellItem, value: string | number) => {
    setSpells(char.spells.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleRoll = (spell: SpellItem) => {
    if (!spell.diceType) return;
    const sides = parseInt(spell.diceType.slice(1), 10);
    const result = rollDie(sides);
    let modifier = 0;
    if (spell.diceSkill) {
      const skillDef = tormenta20.skillList.find((s) => s.id === spell.diceSkill);
      if (skillDef) {
        const attrVal = char.attributes[skillDef.attribute];
        const trained = char.skills[spell.diceSkill] ?? false;
        modifier = skillTotal(attrVal, trained, char.level);
      }
    }
    rollDice({
      rollerName: char.name || characterName,
      label: spell.name || 'Magia',
      diceExpr: `1${spell.diceType}`,
      result,
      modifier,
      total: result + modifier,
    });
  };

  return (
    <div>
      <div className="flex-between mb2">
        <p className="sec-title" style={{ margin: 0 }}>Magias e Habilidades</p>
        <button className="btn btn-secondary btn-sm" onClick={addSpell}>+ Adicionar</button>
      </div>

      {char.spells.length === 0 ? (
        <p className="text-muted text-sm" style={{ padding: '20px 0' }}>Nenhuma magia. Clique em "+ Adicionar".</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {char.spells.map((spell) => (
            <div key={spell.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div className="g3" style={{ flex: 1 }}>
                  <div className="form-row">
                    <label>Nome</label>
                    <input
                      value={spell.name}
                      placeholder="Nome da magia"
                      onChange={(e) => updateSpell(spell.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Círculo / Nível</label>
                    <input
                      value={spell.circleOrLevel}
                      placeholder="Ex: 3º círculo"
                      onChange={(e) => updateSpell(spell.id, 'circleOrLevel', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Custo de Mana</label>
                    <input
                      type="number"
                      min={0}
                      value={spell.manaCost}
                      onChange={(e) => updateSpell(spell.id, 'manaCost', Number(e.target.value))}
                    />
                  </div>
                </div>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => removeSpell(spell.id)}
                  style={{ color: 'var(--danger)', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
              <div className="g3" style={{ marginTop: 8 }}>
                <div className="form-row">
                  <label>Escola</label>
                  <input
                    value={spell.school}
                    placeholder="Ex: Transmutação"
                    onChange={(e) => updateSpell(spell.id, 'school', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Alcance</label>
                  <input
                    value={spell.range}
                    placeholder="Ex: 9 quadrados"
                    onChange={(e) => updateSpell(spell.id, 'range', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Duração</label>
                  <input
                    value={spell.duration}
                    placeholder="Ex: Cena"
                    onChange={(e) => updateSpell(spell.id, 'duration', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 8 }}>
                <label>Descrição</label>
                <textarea
                  value={spell.description}
                  placeholder="Descreva o efeito da magia..."
                  onChange={(e) => updateSpell(spell.id, 'description', e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>
              {/* Dice config */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                <div className="form-row" style={{ flex: '0 0 auto', minWidth: 80 }}>
                  <label>Dado</label>
                  <select
                    value={spell.diceType ?? ''}
                    onChange={(e) => updateSpell(spell.id, 'diceType', e.target.value)}
                  >
                    <option value="">—</option>
                    {DICE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-row" style={{ flex: '1 1 140px', minWidth: 140 }}>
                  <label>Perícia (bônus)</label>
                  <select
                    value={spell.diceSkill ?? ''}
                    onChange={(e) => updateSpell(spell.id, 'diceSkill', e.target.value)}
                    disabled={!spell.diceType}
                  >
                    <option value="">Nenhuma</option>
                    {tormenta20.skillList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {spell.diceType && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRoll(spell)}
                    style={{ alignSelf: 'flex-end', marginBottom: 1 }}
                  >
                    🎲 Rolar {spell.diceType}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
