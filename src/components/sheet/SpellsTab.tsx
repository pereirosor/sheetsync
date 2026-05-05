import { useStore } from '../../store';
import type { SpellItem } from '../../types';
import { evalDiceExpr } from '../../utils/dice';

interface Props {
  characterName: string;
}

const genId = () => Math.random().toString(36).slice(2, 9);

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
  const updateSpell = (id: string, field: keyof SpellItem, value: string | number) =>
    setSpells(char.spells.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleRoll = (spell: SpellItem) => {
    if (!spell.diceExpr?.trim()) return;
    const { total, breakdown } = evalDiceExpr(spell.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: spell.name || 'Magia', diceExpr: spell.diceExpr, breakdown, total });
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
                    <input value={spell.name} placeholder="Nome da magia"
                      onChange={(e) => updateSpell(spell.id, 'name', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Círculo / Nível</label>
                    <input value={spell.circleOrLevel} placeholder="Ex: 3º círculo"
                      onChange={(e) => updateSpell(spell.id, 'circleOrLevel', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Custo de Mana</label>
                    <input type="number" min={0} value={spell.manaCost}
                      onChange={(e) => updateSpell(spell.id, 'manaCost', Number(e.target.value))} />
                  </div>
                </div>
                <button className="btn-ghost btn-sm" onClick={() => removeSpell(spell.id)}
                  style={{ color: 'var(--danger)', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
              <div className="g3" style={{ marginTop: 8 }}>
                <div className="form-row">
                  <label>Escola</label>
                  <input value={spell.school} placeholder="Ex: Transmutação"
                    onChange={(e) => updateSpell(spell.id, 'school', e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Alcance</label>
                  <input value={spell.range} placeholder="Ex: 9 quadrados"
                    onChange={(e) => updateSpell(spell.id, 'range', e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Duração</label>
                  <input value={spell.duration} placeholder="Ex: Cena"
                    onChange={(e) => updateSpell(spell.id, 'duration', e.target.value)} />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 8 }}>
                <label>Descrição</label>
                <textarea value={spell.description} placeholder="Descreva o efeito da magia..."
                  onChange={(e) => updateSpell(spell.id, 'description', e.target.value)}
                  style={{ minHeight: 60 }} />
              </div>
              {/* Dice expression */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <label>Dado de Dano / Efeito</label>
                  <input
                    value={spell.diceExpr ?? ''}
                    placeholder="Ex: 2d6+3+Misticismo"
                    onChange={(e) => updateSpell(spell.id, 'diceExpr', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRoll(spell)}
                    title="NdM+número+NomePerícia — ex: 2d8+1d4+Misticismo"
                  />
                </div>
                {spell.diceExpr?.trim() && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRoll(spell)}
                    style={{ flexShrink: 0, marginBottom: 1 }}>
                    🎲 Rolar
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
