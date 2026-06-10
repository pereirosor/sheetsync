import { useState } from 'react';
import { useStore } from '../../../../store';
import { evalDiceExpr } from '../../../../utils/dice';
import {
  formatMoney,
  itemPrice,
  itemsForEra,
  weaponPrice,
  weaponsForEra,
} from '../../../../systems/coc7e/equipment';
import type { Character, EquipmentItem } from '../../../../types';

interface Props {
  char: Character;
  characterName: string;
  era: '1920s' | 'modern';
}

const genId = () => Math.random().toString(36).slice(2, 9);

export default function EquipmentTab({ char, characterName, era }: Props) {
  const updateCharacter = useStore((s) => s.updateCharacter);
  const rollDice = useStore((s) => s.rollDice);
  const [searchVal, setSearchVal] = useState('');

  const finance = char.cocFinance ?? { cash: 0, assets: 0, spendingLevel: 0 };
  const equipment = char.equipment ?? [];

  const setItems = (items: EquipmentItem[]) =>
    updateCharacter(characterName, { equipment: items });

  const setCash = (raw: string) => {
    const n = Number(raw);
    if (isNaN(n)) return;
    updateCharacter(characterName, { cocFinance: { ...finance, cash: Math.max(0, n) } });
  };

  const updateItem = (id: string, field: keyof EquipmentItem, value: string | number) =>
    setItems(equipment.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const removeItem = (id: string) =>
    setItems(equipment.filter((i) => i.id !== id));

  const handleRoll = (item: EquipmentItem) => {
    if (!item.diceExpr?.trim()) return;
    const { total, breakdown, diceSum, diceMax } = evalDiceExpr(item.diceExpr, char);
    rollDice({ rollerName: char.name || characterName, label: item.name || 'Item', diceExpr: item.diceExpr, breakdown, total, diceSum, diceMax });
  };

  // Catalog suggestions (era-filtered weapons + items)
  const catalog: { name: string; price: number; add: () => void }[] = [
    ...weaponsForEra(era).map((w) => ({
      name: w.name,
      price: weaponPrice(w, era)!,
      add: () => setItems([...equipment, {
        id: genId(), name: w.name, type: 'weapon' as const,
        bonusOrDamage: w.damage, weight: 0,
        notes: `Alcance ${w.range} · Munição ${w.ammo} · Defeito ${w.malfunction}`,
        diceExpr: w.baseDice || undefined,
      }]),
    })),
    ...itemsForEra(era).map((i) => ({
      name: i.name,
      price: itemPrice(i, era)!,
      add: () => setItems([...equipment, {
        id: genId(), name: i.name, type: 'item' as const,
        bonusOrDamage: '', weight: 0, notes: i.notes ?? '',
      }]),
    })),
  ];

  const matches = searchVal.trim().length >= 2
    ? catalog.filter((c) => c.name.toLowerCase().includes(searchVal.trim().toLowerCase())).slice(0, 8)
    : [];

  const addBlank = () =>
    setItems([...equipment, {
      id: genId(), name: '', type: 'item', bonusOrDamage: '', weight: 0, notes: '',
    }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Finanças */}
      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="sec-title">Dinheiro e Patrimônio</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div>
            <label>Dinheiro ($)</label>
            <input
              type="number"
              value={finance.cash}
              onChange={(e) => setCash(e.target.value)}
              style={{ marginTop: 3 }}
            />
          </div>
          <div>
            <label>Patrimônio</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>
              {formatMoney(finance.assets)}
            </div>
          </div>
          <div>
            <label>Nível de Gastos</label>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>
              {formatMoney(finance.spendingLevel)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)' }}>gastos abaixo disso não precisam de registro</div>
          </div>
        </div>
      </div>

      {/* Adição de itens */}
      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="sec-title">Adicionar Item</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={searchVal}
              placeholder={`Buscar no catálogo (${era === 'modern' ? 'Era Moderna' : 'Anos 1920'})...`}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {matches.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: 'var(--bg-card2)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--r-sm)', marginTop: 2, overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}>
                {matches.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => { m.add(); setSearchVal(''); }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', width: '100%',
                      background: 'transparent', color: 'var(--text)',
                      padding: '6px 10px', fontSize: 13, textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{m.name}</span>
                    <span style={{ color: 'var(--gold)', fontSize: 12 }}>{formatMoney(m.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={addBlank} style={{ whiteSpace: 'nowrap' }}>
            + Item manual
          </button>
        </div>
      </div>

      {/* Tabela de equipamentos */}
      <div className="card" style={{ padding: '12px 14px' }}>
        <div className="sec-title">Inventário</div>
        {equipment.length === 0 ? (
          <p className="text-muted text-sm">Nenhum item. Use a busca acima ou adicione manualmente.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 140 }}>Nome</th>
                  <th style={{ minWidth: 90 }}>Dano/Bônus</th>
                  <th style={{ minWidth: 160 }}>Notas</th>
                  <th style={{ width: 56 }}>Qtd</th>
                  <th style={{ minWidth: 90 }}>Dado</th>
                  <th style={{ width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input value={item.name} placeholder="Nome do item"
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                    </td>
                    <td>
                      <input value={item.bonusOrDamage} placeholder="Ex: 1D10"
                        onChange={(e) => updateItem(item.id, 'bonusOrDamage', e.target.value)} />
                    </td>
                    <td>
                      <input value={item.notes} placeholder="Notas / munição / defeito"
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)} />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity ?? 1}
                        onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                        style={{ textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <input
                        value={item.diceExpr ?? ''}
                        placeholder="Ex: 1d10+1d4"
                        onChange={(e) => updateItem(item.id, 'diceExpr', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRoll(item)}
                        title="Expressão de dado para o dano (ex: 1d10+1d4)"
                      />
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {item.diceExpr?.trim() && (
                        <button className="btn-ghost btn-sm" onClick={() => handleRoll(item)}
                          title="Rolar dano" style={{ fontSize: 13, marginRight: 2 }}>
                          🎲
                        </button>
                      )}
                      <button className="btn-ghost btn-sm" onClick={() => removeItem(item.id)}
                        title="Remover" style={{ fontSize: 13, color: 'var(--danger)' }}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
