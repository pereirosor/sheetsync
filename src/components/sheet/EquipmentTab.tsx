import { useStore } from '../../store';
import type { EquipmentItem } from '../../types';

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

export default function EquipmentTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  const setItems = (equipment: EquipmentItem[]) => updateCharacter(characterName, { equipment });

  const addItem = () => setItems([...char.equipment, emptyItem()]);

  const removeItem = (id: string) => setItems(char.equipment.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number) => {
    setItems(char.equipment.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const totalWeight = char.equipment.reduce((s, i) => s + i.weight, 0);
  const maxWeight = char.attributes.strength * 5;
  const overWeight = totalWeight > maxWeight;

  return (
    <div>
      <div className="flex-between mb2">
        <p className="sec-title" style={{ margin: 0 }}>Equipamentos</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: overWeight ? 'var(--danger)' : 'var(--text2)' }}>
            Peso: <strong style={{ color: overWeight ? 'var(--danger)' : 'var(--text)' }}>{totalWeight}</strong> / {maxWeight} kg
          </span>
          <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Adicionar</button>
        </div>
      </div>

      {char.equipment.length === 0 ? (
        <p className="text-muted text-sm" style={{ padding: '20px 0' }}>Nenhum item. Clique em "+ Adicionar".</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Nome</th>
                <th style={{ minWidth: 90 }}>Tipo</th>
                <th style={{ minWidth: 100 }}>Bônus/Dano</th>
                <th style={{ minWidth: 70 }}>Peso (kg)</th>
                <th style={{ minWidth: 140 }}>Notas</th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {char.equipment.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      value={item.name}
                      placeholder="Nome do item"
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                    >
                      <option value="weapon">Arma</option>
                      <option value="armor">Armadura</option>
                      <option value="item">Item</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={item.bonusOrDamage}
                      placeholder="Ex: 2d6+3"
                      onChange={(e) => updateItem(item.id, 'bonusOrDamage', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, 'weight', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      value={item.notes}
                      placeholder="Observações"
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-ghost btn-sm"
                      onClick={() => removeItem(item.id)}
                      title="Remover"
                      style={{ color: 'var(--danger)', padding: '2px 6px' }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
