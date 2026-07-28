import { useState } from 'react';
import { useStore } from '../../store';
import type { SpellItem, SpellRef } from '../../types';
import { evalDiceExpr } from '../../utils/dice';
import AutocompleteInput from '../ui/AutocompleteInput';
import ConfirmDialog from '../ui/ConfirmDialog';
import tormenta20 from '../../systems/tormenta20';

interface Props {
  characterName: string;
  readOnly?: boolean;
}

const genId = () => Math.random().toString(36).slice(2, 9);
const circleCost = [0, 1, 3, 6, 10, 15];

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

type SpellOption = { name: string } & SpellRef;

export default function SpellsTab({ characterName, readOnly }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);
  const rollDice = useStore((s) => s.rollDice);
  const addToast = useStore((s) => s.addToast);
  const [searchVal, setSearchVal] = useState('');
  const [expandedAmps, setExpandedAmps] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<SpellItem | null>(null);

  if (!char) return null;

  const magicType = tormenta20.classMagicType[char.class] ?? null;

  const spellOptions: SpellOption[] = Object.entries(tormenta20.spellData)
    .filter(([, s]) => magicType === null ? false : (s.spellType === magicType || s.spellType === 'universal'))
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => a.circle - b.circle || a.name.localeCompare(b.name));

  // Ponto único de escrita da aba — o guard aqui cobre add/remove/editar.
  const setSpells = (spells: SpellItem[]) => {
    if (readOnly) return;
    updateCharacter(characterName, { spells });
  };
  const addSpell = () => setSpells([...char.spells, emptySpell()]);
  const confirmRemove = () => {
    if (pendingDelete) setSpells(char.spells.filter((s) => s.id !== pendingDelete.id));
  };
  const updateSpell = (id: string, field: keyof SpellItem, value: string | number) =>
    setSpells(char.spells.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const handleRoll = (spell: SpellItem) => {
    if (!spell.diceExpr?.trim()) return;
    const { total, breakdown, diceSum, diceMax } = evalDiceExpr(spell.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: spell.name || 'Magia', diceExpr: spell.diceExpr, breakdown, total, diceSum, diceMax });
  };

  const toggleAmp = (id: string) =>
    setExpandedAmps((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div>
      {pendingDelete && (
        <ConfirmDialog
          title="Remover magia"
          message={`Deletar a magia '${pendingDelete.name || 'sem nome'}'? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          onConfirm={confirmRemove}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <div className="flex-between mb2">
        <p className="sec-title" style={{ margin: 0 }}>Magias e Habilidades</p>
        <button className="btn btn-secondary btn-sm" onClick={addSpell}>+ Vazia</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <AutocompleteInput<SpellOption>
          value={searchVal}
          onChange={setSearchVal}
          onSelect={(opt) => {
            if (char.spells.some((s) => s.name === opt.name)) {
              addToast(`Você já conhece a magia "${opt.name}".`, 'warning');
              setSearchVal('');
              return;
            }
            setSpells([...char.spells, {
              id: genId(), name: opt.name,
              circleOrLevel: `${opt.circle}º círculo`,
              manaCost: circleCost[opt.circle] ?? 0,
              school: opt.school, range: opt.range,
              duration: opt.duration, description: opt.description,
              amplifications: opt.amplifications,
            }]);
            setSearchVal('');
          }}
          options={spellOptions}
          getLabel={(o) => o.name}
          getSublabel={(o) => `${o.circle}º círculo — ${o.school}`}
          placeholder={magicType ? `Buscar magia ${magicType === 'arcana' ? 'arcana' : 'divina'}…` : 'Sua classe não usa magia'}
          disabled={!magicType}
        />
      </div>

      {char.spells.length === 0 ? (
        <p className="text-muted text-sm" style={{ padding: '20px 0' }}>Nenhuma magia. Use a busca acima ou clique em "+ Vazia".</p>
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
                <button className="btn-ghost btn-sm" onClick={() => setPendingDelete(spell)}
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
                  <input value={spell.range} placeholder="Ex: médio"
                    onChange={(e) => updateSpell(spell.id, 'range', e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Duração</label>
                  <input value={spell.duration} placeholder="Ex: cena"
                    onChange={(e) => updateSpell(spell.id, 'duration', e.target.value)} />
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 8 }}>
                <label>Descrição</label>
                <textarea value={spell.description} placeholder="Descreva o efeito da magia..."
                  onChange={(e) => updateSpell(spell.id, 'description', e.target.value)}
                  style={{ minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <label>Dado de Dano / Efeito</label>
                  <input
                    value={spell.diceExpr ?? ''}
                    placeholder="Ex: 2d6+3+Misticismo"
                    onChange={(e) => updateSpell(spell.id, 'diceExpr', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRoll(spell)}
                  />
                </div>
                {spell.diceExpr?.trim() && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRoll(spell)}
                    style={{ flexShrink: 0, marginBottom: 1 }}>
                    🎲 Rolar
                  </button>
                )}
              </div>
              {spell.amplifications && spell.amplifications.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 10 }}>
                  <button
                    onClick={() => toggleAmp(spell.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 11, color: 'var(--text2)', padding: 0,
                    }}
                  >
                    {expandedAmps.has(spell.id) ? '▲' : '▼'} Aprimoramentos ({spell.amplifications.length})
                  </button>
                  {expandedAmps.has(spell.id) && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {spell.amplifications.map((amp, i) => (
                        <div key={i} style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>+{amp.cost} PM:</span>{' '}
                          {amp.effect}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
