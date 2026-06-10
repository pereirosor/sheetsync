import { useState } from 'react';
import { getOccupationById } from '../../../../systems/coc7e/occupations';
import {
  COC_WEAPON_CATEGORY_LABELS,
  financeFromCredit,
  formatMoney,
  itemPrice,
  itemsForEra,
  weaponPrice,
  weaponsForEra,
  getWeaponById,
  getItemById,
  type CoCWeaponCategory,
} from '../../../../systems/coc7e/equipment';
import type { CoCWizardState } from '../wizardState';

interface Props {
  state: CoCWizardState;
  update: (patch: Partial<CoCWizardState>) => void;
  era: '1920s' | 'modern';
}

type ShopTab = 'weapons' | 'items';

export function getWizardCredit(state: CoCWizardState): number {
  const occ = getOccupationById(state.occupationId);
  return state.skillValues['credito'] ?? (occ ? occ.creditRating[0] : 0);
}

export function purchaseCost(
  purchases: CoCWizardState['purchases'],
  era: '1920s' | 'modern',
): number {
  return purchases.reduce((sum, p) => {
    const price = p.kind === 'weapon'
      ? weaponPrice(getWeaponById(p.defId)!, era)
      : itemPrice(getItemById(p.defId)!, era);
    return sum + (price ?? 0) * p.quantity;
  }, 0);
}

export default function EquipmentStep({ state, update, era }: Props) {
  const [shopTab, setShopTab] = useState<ShopTab>('weapons');

  const credit  = getWizardCredit(state);
  const finance = financeFromCredit(credit, era);
  const spent   = purchaseCost(state.purchases, era);
  const remaining = finance.cash - spent;

  const addPurchase = (defId: string, kind: 'weapon' | 'item', price: number) => {
    if (price > remaining) return;
    const existing = state.purchases.find((p) => p.defId === defId);
    if (existing) {
      update({ purchases: state.purchases.map((p) => p.defId === defId ? { ...p, quantity: p.quantity + 1 } : p) });
    } else {
      update({ purchases: [...state.purchases, { defId, kind, quantity: 1 }] });
    }
  };

  const removePurchase = (defId: string) => {
    const existing = state.purchases.find((p) => p.defId === defId);
    if (existing && existing.quantity > 1) {
      update({ purchases: state.purchases.map((p) => p.defId === defId ? { ...p, quantity: p.quantity - 1 } : p) });
    } else {
      update({ purchases: state.purchases.filter((p) => p.defId !== defId) });
    }
  };

  const weapons = weaponsForEra(era);
  const items   = itemsForEra(era);
  const categories = Object.keys(COC_WEAPON_CATEGORY_LABELS) as CoCWeaponCategory[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Finanças (Tabela II) */}
      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
          Dinheiro e Patrimônio
          <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: 6, fontSize: 11 }}>
            Nível de Crédito {credit} — {finance.bracket}
          </span>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { label: 'Dinheiro', value: remaining, note: spent > 0 ? `de ${formatMoney(finance.cash)}` : 'disponível' },
            { label: 'Patrimônio', value: finance.assets, note: 'imóveis, bens' },
            { label: 'Nível de Gastos', value: finance.spendingLevel, note: 'sem contabilidade' },
          ].map(({ label, value, note }) => (
            <div key={label} style={{
              padding: '6px 8px', borderRadius: 6, textAlign: 'center',
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{formatMoney(value)}</div>
              <div style={{ fontSize: 9, color: 'var(--text2)' }}>{note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
          Itens compatíveis com o padrão de vida do investigador não precisam ser comprados —
          a loja abaixo é para itens dignos de nota (armas, ferramentas de investigação etc.).
        </p>
      </div>

      {/* Loja */}
      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
          Loja — {era === 'modern' ? 'Era Moderna' : 'Anos 1920'}
        </p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {(['weapons', 'items'] as const).map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${shopTab === tab ? 'btn-gold' : 'btn-secondary'}`}
              onClick={() => setShopTab(tab)}
            >
              {tab === 'weapons' ? 'Armas' : 'Itens'}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {shopTab === 'weapons' && categories.map((cat) => {
            const catWeapons = weapons.filter((w) => w.category === cat);
            if (catWeapons.length === 0) return null;
            return (
              <div key={cat}>
                <p style={{ fontSize: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '6px 0 4px' }}>
                  {COC_WEAPON_CATEGORY_LABELS[cat]}
                </p>
                {catWeapons.map((w) => {
                  const price = weaponPrice(w, era)!;
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4, background: 'var(--bg-card2)', marginBottom: 4 }}>
                      <span style={{ flex: 1, fontSize: 13, minWidth: 0 }}>{w.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{w.damage}</span>
                      <span style={{ fontSize: 12, color: 'var(--gold)', marginLeft: 4, whiteSpace: 'nowrap' }}>{formatMoney(price)}</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={price > remaining}
                        onClick={() => addPurchase(w.id, 'weapon', price)}
                        style={{ fontSize: 11, padding: '2px 8px' }}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {shopTab === 'items' && items.map((i) => {
            const price = itemPrice(i, era)!;
            return (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4, background: 'var(--bg-card2)' }}>
                <span style={{ flex: 1, fontSize: 13, minWidth: 0 }}>{i.name}</span>
                {i.notes && <span style={{ fontSize: 10, color: 'var(--text2)' }}>{i.notes}</span>}
                <span style={{ fontSize: 12, color: 'var(--gold)', marginLeft: 4, whiteSpace: 'nowrap' }}>{formatMoney(price)}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={price > remaining}
                  onClick={() => addPurchase(i.id, 'item', price)}
                  style={{ fontSize: 11, padding: '2px 8px' }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>

        {/* Carrinho */}
        {state.purchases.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Itens comprados:</p>
            {state.purchases.map((p) => {
              const def = p.kind === 'weapon' ? getWeaponById(p.defId) : getItemById(p.defId);
              const price = p.kind === 'weapon'
                ? weaponPrice(getWeaponById(p.defId)!, era)!
                : itemPrice(getItemById(p.defId)!, era)!;
              return (
                <div key={p.defId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>
                    {def?.name}
                    {p.quantity > 1 && <span style={{ color: 'var(--gold)', marginLeft: 4 }}>x{p.quantity}</span>}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--gold)' }}>{formatMoney(price * p.quantity)}</span>
                  <button
                    className="btn btn-sm"
                    style={{ fontSize: 11, padding: '1px 6px', color: 'var(--danger)' }}
                    onClick={() => removePurchase(p.defId)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--text2)' }}>Total gasto: <strong style={{ color: 'var(--text)' }}>{formatMoney(spent)}</strong></span>
              <span style={{ color: 'var(--text2)' }}>Restante: <strong style={{ color: 'var(--gold)' }}>{formatMoney(remaining)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
