import { useState } from 'react';
import { useStore } from '../../store';
import type { EquipmentItem, WeaponRef, ArmorRef, GeneralItemRef } from '../../types';
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
    };
  }
  if (opt.kind === 'armor') {
    const r = opt.ref;
    return {
      id: genId(), name: opt.name, type: 'armor',
      bonusOrDamage: r.defenseBonus, weight: r.weight,
      notes: r.penalty ? `Penalidade: ${r.penalty}` : '',
    };
  }
  const r = opt.ref;
  return {
    id: genId(), name: opt.name, type: 'item',
    bonusOrDamage: '', weight: r.weight,
    notes: r.description ?? '',
  };
}

export default function EquipmentTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);
  const rollDice = useStore((s) => s.rollDice);
  const [searchVal, setSearchVal] = useState('');
  const [pendingDelete, setPendingDelete] = useState<EquipmentItem | null>(null);

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
  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number) =>
    setItems(char.equipment.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleRoll = (item: EquipmentItem) => {
    if (!item.diceExpr?.trim()) return;
    const { total, breakdown } = evalDiceExpr(item.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: item.name || 'Item', diceExpr: item.diceExpr, breakdown, total });
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
                <th style={{ minWidth: 130 }}>Nome</th>
                <th style={{ minWidth: 80 }}>Tipo</th>
                <th style={{ minWidth: 90 }}>Bônus/Dano</th>
                <th style={{ minWidth: 70 }}>Crítico</th>
                <th style={{ minWidth: 90 }}>Tipo de Dano</th>
                <th style={{ minWidth: 60 }}>Peso</th>
                <th style={{ minWidth: 120 }}>Notas/Propriedades</th>
                <th style={{ minWidth: 160 }}>Expressão de Dado</th>
                <th style={{ width: 52 }} />
              </tr>
            </thead>
            <tbody>
              {char.equipment.map((item) => (
                <tr key={item.id}>
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
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
            Expressão de dado: use <code style={{ color: 'var(--gold)' }}>NdM+número+NomePerícia</code> — ex: <code style={{ color: 'var(--gold)' }}>2d6+3+Luta</code>
          </p>
        </div>
      )}
    </div>
  );
}
