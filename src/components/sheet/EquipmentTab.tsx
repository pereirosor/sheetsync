import { useState, Fragment } from 'react';
import { useStore } from '../../store';
import type { EquipmentItem, ItemEffect, WeaponRef, ArmorRef, GeneralItemRef } from '../../types';
import { evalDiceExpr } from '../../utils/dice';
import AutocompleteInput from '../ui/AutocompleteInput';
import ConfirmDialog from '../ui/ConfirmDialog';
import tormenta20 from '../../systems/tormenta20';

interface Props {
  characterName: string;
}

const genId = () => Math.random().toString(36).slice(2, 9);

const emptyItem = (): EquipmentItem => ({
  id: genId(),
  name: '',
  type: 'item',
  bonusOrDamage: '',
  weight: 0,
  notes: '',
  equipped: false,
  effects: [],
});

type EquipOption =
  | { kind: 'weapon'; name: string; ref: WeaponRef }
  | { kind: 'armor'; name: string; ref: ArmorRef }
  | { kind: 'item'; name: string; ref: GeneralItemRef };

const allOptions: EquipOption[] = [
  ...Object.entries(tormenta20.weaponData).map(([name, ref]) => ({ kind: 'weapon' as const, name, ref })),
  ...Object.entries(tormenta20.armorData).map(([name, ref]) => ({ kind: 'armor' as const, name, ref })),
  ...Object.entries(tormenta20.generalItemData).map(([name, ref]) => ({ kind: 'item' as const, name, ref })),
];

function optToItem(opt: EquipOption): EquipmentItem {
  if (opt.kind === 'weapon') {
    const r = opt.ref;
    return {
      id: genId(), name: opt.name, type: 'weapon',
      bonusOrDamage: r.damage, weight: r.weight,
      notes: r.properties ?? '',
      damage: r.damage, damageType: r.damageType,
      critical: r.critical, properties: r.properties,
      equipped: true, effects: [],
    };
  }
  if (opt.kind === 'armor') {
    const r = opt.ref;
    return {
      id: genId(), name: opt.name, type: 'armor',
      bonusOrDamage: r.defenseBonus, weight: r.weight,
      notes: r.penalty ? `Penalidade: ${r.penalty}` : '',
      equipped: true, effects: [],
    };
  }
  const r = opt.ref;
  return {
    id: genId(), name: opt.name, type: 'item',
    bonusOrDamage: '', weight: r.weight,
    notes: r.description ?? '',
    equipped: false, effects: [],
  };
}

interface EffectFormState {
  skillId: string;
  value: string;
}

const emptyEffectForm = (): EffectFormState => ({
  skillId: tormenta20.skillList[0]?.id ?? '',
  value: '1',
});

export default function EquipmentTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);
  const rollDice = useStore((s) => s.rollDice);
  const [searchVal, setSearchVal] = useState('');
  const [pendingDelete, setPendingDelete] = useState<EquipmentItem | null>(null);
  const [expandedEffects, setExpandedEffects] = useState<string | null>(null);
  const [effectForm, setEffectForm] = useState<EffectFormState>(emptyEffectForm);

  if (!char) return null;

  const setItems = (equipment: EquipmentItem[]) => updateCharacter(characterName, { equipment });
  const addItem = () => setItems([...char.equipment, emptyItem()]);
  const requestRemove = (item: EquipmentItem) => {
    if ((item.quantity ?? 1) > 1) {
      setItems(char.equipment.map((i) => i.id === item.id ? { ...i, quantity: (i.quantity ?? 1) - 1 } : i));
    } else if (item.type === 'weapon' || item.type === 'armor') {
      setPendingDelete(item);
    } else {
      setItems(char.equipment.filter((i) => i.id !== item.id));
    }
  };
  const confirmRemove = () => {
    if (pendingDelete) setItems(char.equipment.filter((i) => i.id !== pendingDelete.id));
  };
  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number | boolean) =>
    setItems(char.equipment.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  const updateItemEffects = (id: string, effects: ItemEffect[]) =>
    setItems(char.equipment.map((i) => (i.id === id ? { ...i, effects } : i)));

  const handleRoll = (item: EquipmentItem) => {
    if (!item.diceExpr?.trim()) return;
    const { total, breakdown, diceSum, diceMax } = evalDiceExpr(item.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: item.name || 'Item', diceExpr: item.diceExpr, breakdown, total, diceSum, diceMax });
  };

  const addEffect = (itemId: string, currentEffects: ItemEffect[]) => {
    const val = parseInt(effectForm.value, 10);
    if (!effectForm.skillId || isNaN(val)) return;
    const newEffect: ItemEffect = { type: 'skillBonus', skillId: effectForm.skillId, value: val };
    updateItemEffects(itemId, [...currentEffects, newEffect]);
    setEffectForm(emptyEffectForm());
  };

  const removeEffect = (itemId: string, currentEffects: ItemEffect[], idx: number) => {
    updateItemEffects(itemId, currentEffects.filter((_, i) => i !== idx));
  };

  const toggleEffects = (id: string) => {
    setExpandedEffects((prev) => (prev === id ? null : id));
    setEffectForm(emptyEffectForm());
  };

  const totalWeight = char.equipment.reduce((s, i) => s + i.weight * (i.quantity ?? 1), 0);
  const maxWeight = char.attributes.strength * 5;
  const overWeight = totalWeight > maxWeight;

  const deleteTypeLabel = pendingDelete?.type === 'weapon' ? 'arma' : 'armadura';

  return (
    <div>
      {pendingDelete && (
        <ConfirmDialog
          title={`Remover ${deleteTypeLabel}`}
          message={`Deletar a ${deleteTypeLabel} '${pendingDelete.name || 'sem nome'}'? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          onConfirm={confirmRemove}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <div className="flex-between mb2">
        <p className="sec-title" style={{ margin: 0 }}>Equipamentos</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: overWeight ? 'var(--danger)' : 'var(--text2)' }}>
            Peso: <strong style={{ color: overWeight ? 'var(--danger)' : 'var(--text)' }}>{totalWeight}</strong> / {maxWeight} kg
          </span>
          <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Vazio</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <AutocompleteInput<EquipOption>
          value={searchVal}
          onChange={setSearchVal}
          onSelect={(opt) => {
            const existing = char.equipment.find((i) => i.name === opt.name && i.type === (opt.kind === 'weapon' ? 'weapon' : opt.kind === 'armor' ? 'armor' : 'item'));
            if (existing) {
              setItems(char.equipment.map((i) => i.id === existing.id ? { ...i, quantity: (i.quantity ?? 1) + 1 } : i));
            } else {
              setItems([...char.equipment, optToItem(opt)]);
            }
            setSearchVal('');
          }}
          options={allOptions}
          getLabel={(o) => o.name}
          getSublabel={(o) =>
            o.kind === 'weapon' ? `${o.ref.damage} ${o.ref.damageType} — Crítico ${o.ref.critical}` :
            o.kind === 'armor' ? `Defesa ${o.ref.defenseBonus}${o.ref.penalty ? `, Pen. ${o.ref.penalty}` : ''}` :
            (o.ref.description ?? '')
          }
          placeholder="Buscar arma, armadura ou item…"
        />
      </div>

      {char.equipment.length === 0 ? (
        <p className="text-muted text-sm" style={{ padding: '20px 0' }}>Nenhum item. Use a busca acima ou clique em "+ Vazio".</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th style={{ width: 32, textAlign: 'center' }} title="Equipado">Eq.</th>
                <th style={{ minWidth: 130 }}>Nome</th>
                <th style={{ minWidth: 80 }}>Tipo</th>
                <th style={{ minWidth: 90 }}>Bônus/Dano</th>
                <th style={{ minWidth: 70 }}>Crítico</th>
                <th style={{ minWidth: 90 }}>Tipo de Dano</th>
                <th style={{ minWidth: 60 }}>Peso</th>
                <th style={{ minWidth: 120 }}>Notas/Propriedades</th>
                <th style={{ minWidth: 160 }}>Expressão de Dado</th>
                <th style={{ width: 68 }} />
              </tr>
            </thead>
            <tbody>
              {char.equipment.map((item) => (
                <Fragment key={item.id}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={item.equipped ?? false}
                        onChange={(e) => updateItem(item.id, 'equipped', e.target.checked)}
                        title="Marcar como equipado (conta bônus de perícia)"
                      />
                    </td>
                    <td style={{ position: 'relative' }}>
                      <input value={item.name} placeholder="Nome do item"
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                      {(item.quantity ?? 1) > 1 && (
                        <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--gold)', fontWeight: 700, pointerEvents: 'none' }}>
                          x{item.quantity}
                        </span>
                      )}
                    </td>
                    <td>
                      <select value={item.type} onChange={(e) => updateItem(item.id, 'type', e.target.value)}>
                        <option value="weapon">Arma</option>
                        <option value="armor">Armadura</option>
                        <option value="item">Item</option>
                      </select>
                    </td>
                    <td>
                      <input value={item.bonusOrDamage} placeholder="Ex: 1d8"
                        onChange={(e) => updateItem(item.id, 'bonusOrDamage', e.target.value)} />
                    </td>
                    <td>
                      {item.type === 'weapon' ? (
                        <input value={item.critical ?? ''} placeholder="Ex: 19"
                          onChange={(e) => updateItem(item.id, 'critical', e.target.value)} />
                      ) : <span style={{ color: 'var(--text2)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      {item.type === 'weapon' ? (
                        <input value={item.damageType ?? ''} placeholder="Corte"
                          onChange={(e) => updateItem(item.id, 'damageType', e.target.value)} />
                      ) : <span style={{ color: 'var(--text2)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <input type="number" min={0} value={item.weight}
                        onChange={(e) => updateItem(item.id, 'weight', Number(e.target.value))} />
                    </td>
                    <td>
                      <input value={item.notes} placeholder="Notas / propriedades"
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)} />
                    </td>
                    <td>
                      <input
                        value={item.diceExpr ?? ''}
                        placeholder="Ex: 2d6+3+Luta"
                        onChange={(e) => updateItem(item.id, 'diceExpr', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRoll(item)}
                        title="Expressão de dado: NdM+bônus+Perícia (ex: 2d6+3+Luta)"
                      />
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => toggleEffects(item.id)}
                        title={`Efeitos mágicos${(item.effects?.length ?? 0) > 0 ? ` (${item.effects!.length})` : ''}`}
                        style={{
                          fontSize: 13, marginRight: 2,
                          color: (item.effects?.length ?? 0) > 0 ? 'var(--gold)' : 'var(--text2)',
                        }}
                      >
                        ✦{(item.effects?.length ?? 0) > 0 ? `(${item.effects!.length})` : ''}
                      </button>
                      {item.diceExpr?.trim() && (
                        <button className="btn-ghost btn-sm" onClick={() => handleRoll(item)}
                          title="Rolar" style={{ fontSize: 13, marginRight: 2 }}>
                          🎲
                        </button>
                      )}
                      <button className="btn-ghost btn-sm" onClick={() => requestRemove(item)}
                        title="Remover" style={{ color: 'var(--danger)', padding: '2px 6px' }}>
                        ✕
                      </button>
                    </td>
                  </tr>
                  {expandedEffects === item.id && (
                    <tr>
                      <td colSpan={10} style={{ padding: '8px 12px', background: 'var(--bg-card2)', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', margin: 0 }}>
                            Efeitos mágicos — {item.name || 'Item'}
                          </p>

                          {(item.effects ?? []).length === 0 && (
                            <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', margin: 0 }}>
                              Nenhum efeito. Adicione abaixo.
                            </p>
                          )}

                          {(item.effects ?? []).map((eff, idx) => {
                            const skillName = tormenta20.skillList.find((s) => s.id === eff.skillId)?.name ?? eff.skillId;
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  fontSize: 12, padding: '2px 8px', borderRadius: 4,
                                  background: 'rgba(201,168,76,.15)', color: 'var(--gold)',
                                  border: '1px solid rgba(201,168,76,.3)',
                                }}>
                                  +{eff.value} em {skillName}
                                </span>
                                <button
                                  className="btn-ghost btn-sm"
                                  onClick={() => removeEffect(item.id, item.effects ?? [], idx)}
                                  style={{ color: 'var(--danger)', fontSize: 11, padding: '1px 5px' }}
                                  title="Remover efeito"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Adicionar:</span>
                            <select
                              value={effectForm.skillId}
                              onChange={(e) => setEffectForm((f) => ({ ...f, skillId: e.target.value }))}
                              style={{ fontSize: 12, padding: '2px 6px' }}
                            >
                              {tormenta20.skillList.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={effectForm.value}
                              onChange={(e) => setEffectForm((f) => ({ ...f, value: e.target.value }))}
                              style={{ width: 50, fontSize: 12, padding: '2px 6px' }}
                              title="Valor do bônus (pode ser negativo)"
                            />
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => addEffect(item.id, item.effects ?? [])}
                              style={{ fontSize: 12 }}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
            Eq. = Equipado (bônus de perícia contabilizados) · ✦ = Efeitos mágicos ·{' '}
            Expressão de dado: use <code style={{ color: 'var(--gold)' }}>NdM+número+NomePerícia</code>
          </p>
        </div>
      )}
    </div>
  );
}
