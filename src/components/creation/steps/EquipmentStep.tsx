import { useState } from 'react';
import tormenta20 from '../../../systems/tormenta20';
import type { EquipmentItem } from '../../../types';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }

const AUTO_KIT = ['Mochila', 'Saco de Dormir', 'Traje de Viajante'];

const ITEM_PRICES: Record<string, number> = {
  // armas simples
  'Adaga': 3, 'Espada Curta': 10, 'Foice': 5, 'Manopla': 3, 'Clava': 3, 'Lança': 5, 'Maça': 10,
  'Bordão': 3, 'Pique': 5, 'Tacape': 5, 'Arco Curto': 25, 'Besta Leve': 30, 'Azagaia': 3, 'Funda': 1,
  // armas marciais
  'Machadinha': 5, 'Cimitarra': 15, 'Espada Longa': 15, 'Florete': 15, 'Machado de Batalha': 10,
  'Mangual': 8, 'Martelo de Guerra': 12, 'Picareta': 8, 'Tridente': 15, 'Alabarda': 10,
  'Alfange': 20, 'Gadanho': 20, 'Lança Montada': 10, 'Machado de Guerra': 20, 'Montante': 50,
  'Arco Longo': 75, 'Besta Pesada': 50,
  // armaduras
  'Armadura Acolchoada': 5, 'Armadura de Couro': 20, 'Couro Batido': 100, 'Gibão de Peles': 250,
  'Couraça': 200, 'Brunea': 300, 'Cota de Malha': 350, 'Loriga Segmentada': 400,
  'Meia Armadura': 600, 'Armadura Completa': 1500, 'Escudo Leve': 6, 'Escudo Pesado': 12,
  // itens gerais
  'Água Benta': 25, 'Algemas': 15, 'Algibeira': 1, 'Barraca': 10, 'Corda (10m)': 1,
  'Espelho de Metal': 10, 'Instrumento Musical': 5, 'Kit de Ofício': 50, 'Kit de Disfarces': 50,
  'Kit de Ladrão': 30, 'Kit de Medicamentos': 50, 'Lampião': 7, 'Mochila': 2, 'Odre': 1,
  'Pé de Cabra': 2, 'Pederneira': 1, 'Ração de Viagem (por dia)': 1, 'Saco de Dormir': 1,
  'Saco de Lona': 0.5, 'Tocha': 0.1, 'Vara de Madeira (3m)': 0.5,
  'Ácido': 10, 'Bálsamo Restaurador': 50, 'Bomba': 50, 'Essência de Mana': 50, 'Fogo Alquímico': 20,
};

export default function EquipmentStep({ state, update }: Props) {
  const [shopTab, setShopTab] = useState<'weapons' | 'armor' | 'items'>('items');
  const prof = tormenta20.classProficiencies[state.charClass] ?? { martialWeapons: false, heavyArmor: false, shields: false };

  const noArmor = state.charClass === 'Arcanista';
  const simpleWeapons = Object.keys(tormenta20.weaponData).filter((n) => tormenta20.weaponData[n].category === 'simples');
  const martialWeapons = Object.keys(tormenta20.weaponData).filter((n) => tormenta20.weaponData[n].category === 'marcial');
  const lightArmors = Object.keys(tormenta20.armorData).filter((n) => tormenta20.armorData[n].type === 'leve');
  const heavyArmors = Object.keys(tormenta20.armorData).filter((n) => tormenta20.armorData[n].type === 'pesada');

  const rollMoney = () => {
    const total = rollD6() + rollD6() + rollD6() + rollD6();
    update({ startingMoney: total, shoppedItems: [] });
  };

  const spentMoney = state.shoppedItems.reduce((sum, i) => sum + i.price, 0);
  const remainingMoney = state.startingMoney - spentMoney;

  const addShopItem = (name: string, price: number) => {
    if (price > remainingMoney) return;
    const genId = () => Math.random().toString(36).slice(2, 9);
    const item: EquipmentItem & { price: number } = {
      id: genId(),
      name,
      type: 'item',
      bonusOrDamage: '',
      weight: (tormenta20.generalItemData[name]?.weight ?? tormenta20.weaponData[name]?.weight ?? tormenta20.armorData[name]?.weight ?? 0),
      notes: '',
      price,
    };
    update({ shoppedItems: [...state.shoppedItems, item] });
  };

  const removeShopItem = (id: string) => {
    update({ shoppedItems: state.shoppedItems.filter((i) => i.id !== id) });
  };

  const shopItems = {
    weapons: [...Object.entries(tormenta20.weaponData).map(([name, w]) => ({ name, price: ITEM_PRICES[name] ?? 0, info: `${w.damage} ${w.damageType}` }))],
    armor: [...Object.entries(tormenta20.armorData).map(([name, a]) => ({ name, price: ITEM_PRICES[name] ?? 0, info: `Defesa ${a.defenseBonus}` }))],
    items: [...Object.entries(tormenta20.generalItemData).map(([name]) => ({ name, price: ITEM_PRICES[name] ?? 0, info: tormenta20.generalItemData[name].description ?? '' }))],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Kit automático */}
      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Kit inicial (automático)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {AUTO_KIT.map((item) => (
            <span key={item} className="wizard-tag">{item}</span>
          ))}
        </div>
      </div>

      {/* Arma simples */}
      <div className="form-row">
        <label>Arma simples (obrigatório)</label>
        <select value={state.weaponSimple} onChange={(e) => update({ weaponSimple: e.target.value })}>
          <option value="">— Selecione —</option>
          {simpleWeapons.map((name) => {
            const w = tormenta20.weaponData[name];
            return <option key={name} value={name}>{name} ({w.damage})</option>;
          })}
        </select>
      </div>

      {/* Arma marcial (se proficiente) */}
      {prof.martialWeapons && (
        <div className="form-row">
          <label>Arma marcial (proficiente)</label>
          <select value={state.weaponMartial} onChange={(e) => update({ weaponMartial: e.target.value })}>
            <option value="">— Selecione —</option>
            {martialWeapons.map((name) => {
              const w = tormenta20.weaponData[name];
              return <option key={name} value={name}>{name} ({w.damage})</option>;
            })}
          </select>
        </div>
      )}

      {/* Armadura — Arcanistas não recebem armadura inicial */}
      {noArmor ? (
        <div className="wizard-info-card">
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Arcanistas começam <b>sem armadura</b> (regra T20 — armaduras interferem nos gestos mágicos).
          </p>
        </div>
      ) : (
        <div className="form-row">
          <label>Armadura inicial {prof.heavyArmor ? '(pode escolher pesada)' : '(leve)'}</label>
          <select value={state.armorPick} onChange={(e) => update({ armorPick: e.target.value })}>
            <option value="">— Selecione —</option>
            <optgroup label="Armadura Leve">
              {lightArmors.map((name) => {
                const a = tormenta20.armorData[name];
                return <option key={name} value={name}>{name} (Def {a.defenseBonus})</option>;
              })}
            </optgroup>
            {prof.heavyArmor && (
              <optgroup label="Armadura Pesada">
                {heavyArmors.map((name) => {
                  const a = tormenta20.armorData[name];
                  return <option key={name} value={name}>{name} (Def {a.defenseBonus})</option>;
                })}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Escudo (se proficiente) */}
      {prof.shields && (
        <div className="form-row">
          <label>Escudo (proficiente)</label>
          <select value={state.shieldPick} onChange={(e) => update({ shieldPick: e.target.value })}>
            <option value="">— Nenhum —</option>
            <option value="Escudo Leve">Escudo Leve (+1 Def)</option>
          </select>
        </div>
      )}

      {/* Dinheiro inicial */}
      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Dinheiro Inicial (4d6 T$)</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary" onClick={rollMoney} disabled={state.startingMoney > 0}>
            {state.startingMoney > 0 ? `Rolado: ${state.startingMoney} T$` : 'Rolar 4d6 T$'}
          </button>
          {state.startingMoney > 0 && (
            <>
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>{remainingMoney} T$</span>
              <span style={{ color: 'var(--text2)', fontSize: 12 }}>restantes</span>
              <button className="btn btn-secondary btn-sm" onClick={() => update({ startingMoney: 0, shoppedItems: [] })}>
                Rerolar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loja */}
      {state.startingMoney > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Loja — gaste seus T$</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['weapons', 'armor', 'items'] as const).map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${shopTab === tab ? 'btn-gold' : 'btn-secondary'}`}
                onClick={() => setShopTab(tab)}
              >
                {tab === 'weapons' ? 'Armas' : tab === 'armor' ? 'Armaduras' : 'Itens'}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {shopItems[shopTab].map(({ name, price, info }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4, background: 'var(--bg-card2)' }}>
                <span style={{ flex: 1, fontSize: 13 }}>{name}</span>
                {info && <span style={{ fontSize: 11, color: 'var(--text2)' }}>{info}</span>}
                <span style={{ fontSize: 12, color: 'var(--gold)', marginLeft: 4 }}>{price} T$</span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={price > remainingMoney}
                  onClick={() => addShopItem(name, price)}
                  style={{ fontSize: 11, padding: '2px 8px' }}
                >
                  +
                </button>
              </div>
            ))}
          </div>

          {state.shoppedItems.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Itens comprados:</p>
              {state.shoppedItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--gold)' }}>{item.price} T$</span>
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '1px 6px', color: 'var(--danger)' }} onClick={() => removeShopItem(item.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
