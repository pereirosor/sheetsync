import { useStore } from '../../store';
import type { EquipmentItem } from '../../types';
import { evalDiceExpr } from '../../utils/dice';

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
  const rollDice = useStore((s) => s.rollDice);

  if (!char) return null;

  const setItems = (equipment: EquipmentItem[]) => updateCharacter(characterName, { equipment });
  const addItem = () => setItems([...char.equipment, emptyItem()]);
  const removeItem = (id: string) => setItems(char.equipment.filter((i) => i.id !== id));
  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number) =>
    setItems(char.equipment.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleRoll = (item: EquipmentItem) => {
    if (!item.diceExpr?.trim()) return;
    const { total, breakdown } = evalDiceExpr(item.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: item.name || 'Item', diceExpr: item.diceExpr, breakdown, total });
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
                <th style={{ minWidth: 130 }}>Nome</th>
                <th style={{ minWidth: 80 }}>Tipo</th>
                <th style={{ minWidth: 90 }}>Bônus/Dano</th>
                <th style={{ minWidth: 60 }}>Peso</th>
                <th style={{ minWidth: 120 }}>Notas</th>
                <th style={{ minWidth: 160 }}>Expressão de Dado</th>
                <th style={{ width: 52 }} />
              </tr>
            </thead>
            <tbody>
              {char.equipment.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input value={item.name} placeholder="Nome do item"
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                  </td>
                  <td>
                    <select value={item.type} onChange={(e) => updateItem(item.id, 'type', e.target.value)}>
                      <option value="weapon">Arma</option>
                      <option value="armor">Armadura</option>
                      <option value="item">Item</option>
                    </select>
                  </td>
                  <td>
                    <input value={item.bonusOrDamage} placeholder="Ex: 2d6+3"
                      onChange={(e) => updateItem(item.id, 'bonusOrDamage', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" min={0} value={item.weight}
                      onChange={(e) => updateItem(item.id, 'weight', Number(e.target.value))} />
                  </td>
                  <td>
                    <input value={item.notes} placeholder="Observações"
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
                    <button className="btn-ghost btn-sm" onClick={() => removeItem(item.id)}
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
