import { useState } from 'react';
import tormenta20 from '../../../systems/tormenta20';
import type { AttributeKey } from '../../../types';
import type { WizardState } from '../wizardState';

const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'Força', dexterity: 'Destreza', constitution: 'Constituição',
  intelligence: 'Inteligência', wisdom: 'Sabedoria', charisma: 'Carisma',
};
const ALL_ATTRS: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const POINT_BUY_COST: Record<number, number> = { '-1': -1, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
const MAX_PTS = 10;
const MIN_BASE = -1;
const MAX_BASE = 4;

function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }
function roll4d6Drop(): number {
  const rolls = [rollD6(), rollD6(), rollD6(), rollD6()].sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

function calcMod(val: number) { return Math.floor((val - 10) / 2); }
function modStr(val: number) {
  const m = calcMod(val);
  return m >= 0 ? `+${m}` : `${m}`;
}

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function AttributesStep({ state, update }: Props) {
  const [pendingPool, setPendingPool] = useState<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  const raceInfo = tormenta20.raceData[state.race];
  const fixedMods = raceInfo?.attributeMods ?? {};
  const varBonuses = state.raceBonusChoices ?? {};

  const getTotal = (attr: AttributeKey) => {
    const base = state.attributesBase[attr];
    const fixed = (fixedMods as Record<string, number>)[attr] ?? 0;
    const variable = (varBonuses as Record<string, number>)[attr] ?? 0;
    return 10 + base + fixed + variable;
  };

  const ptSpent = ALL_ATTRS.reduce((sum, a) => sum + (POINT_BUY_COST[state.attributesBase[a]] ?? 0), 0);
  const ptLeft = MAX_PTS - ptSpent;

  const setBase = (attr: AttributeKey, val: number) => {
    if (val < MIN_BASE || val > MAX_BASE) return;
    const newBases = { ...state.attributesBase, [attr]: val };
    const newSpent = ALL_ATTRS.reduce((sum, a) => sum + (POINT_BUY_COST[newBases[a]] ?? 0), 0);
    if (newSpent > MAX_PTS) return;
    update({ attributesBase: newBases });
  };

  const rollAll = () => {
    const pool = ALL_ATTRS.map(() => roll4d6Drop());
    setPendingPool(pool);
    update({ rolledPool: pool, rolledAssignments: {}, attributesBase: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 } });
  };

  const assignRoll = (attr: AttributeKey, poolIdx: number) => {
    const prev = { ...state.rolledAssignments };
    const oldIdx = Object.entries(prev).find(([, v]) => v === poolIdx)?.[0] as AttributeKey | undefined;
    if (oldIdx) delete prev[oldIdx];
    prev[attr] = poolIdx;
    const newBases: Record<AttributeKey, number> = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
    for (const [a, idx] of Object.entries(prev) as [AttributeKey, number][]) {
      const pool = state.rolledPool.length > 0 ? state.rolledPool : pendingPool;
      newBases[a] = (pool[idx] ?? 10) - 10;
    }
    update({ rolledAssignments: prev, attributesBase: newBases });
  };

  const pool = state.rolledPool.length > 0 ? state.rolledPool : pendingPool;
  const assignedIdxs = new Set(Object.values(state.rolledAssignments));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['point-buy', 'roll'] as const).map((m) => (
          <button
            key={m}
            className={`btn ${state.attributeMethod === m ? 'btn-gold' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => update({ attributeMethod: m, attributesBase: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }, rolledPool: [], rolledAssignments: {} })}
          >
            {m === 'point-buy' ? 'Compra de Pontos' : 'Rolar 4d6'}
          </button>
        ))}
      </div>

      {state.attributeMethod === 'point-buy' && (
        <>
          <div className="wizard-info-card" style={{ textAlign: 'center' }}>
            <span style={{ color: ptLeft < 0 ? 'var(--danger)' : 'var(--gold)', fontWeight: 700, fontSize: 18 }}>
              {ptLeft}
            </span>
            <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 6 }}>pontos restantes</span>
            <p style={{ color: 'var(--text2)', fontSize: 11, marginTop: 4 }}>Base: –1 a +4 (cada +1 custa 1 ponto)</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALL_ATTRS.map((attr) => {
              const base = state.attributesBase[attr];
              const total = getTotal(attr);
              const fixed = (fixedMods as Record<string, number>)[attr] ?? 0;
              const variable = (varBonuses as Record<string, number>)[attr] ?? 0;
              const raceMod = fixed + variable;
              return (
                <div key={attr} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{ATTR_LABELS[attr]}</span>
                  <button className="btn btn-secondary btn-sm" style={{ width: 28 }} onClick={() => setBase(attr, base - 1)} disabled={base <= MIN_BASE}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{base >= 0 ? `+${base}` : base}</span>
                  <button className="btn btn-secondary btn-sm" style={{ width: 28 }} onClick={() => setBase(attr, base + 1)} disabled={base >= MAX_BASE || ptLeft <= 0}>+</button>
                  {raceMod !== 0 && (
                    <span style={{ fontSize: 11, color: raceMod > 0 ? 'var(--success, #5ce65c)' : 'var(--danger)', width: 36, textAlign: 'center' }}>
                      {raceMod > 0 ? `+${raceMod}` : raceMod}
                    </span>
                  )}
                  <span style={{ width: 52, textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
                    {total} <span style={{ fontSize: 11, color: 'var(--text2)' }}>({modStr(total)})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {state.attributeMethod === 'roll' && (
        <>
          <button className="btn btn-gold" onClick={rollAll}>
            Rolar 4d6 (descarta menor)
          </button>
          {pool.length > 0 && (
            <>
              <div className="wizard-info-card">
                <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Resultados — clique no atributo para atribuir</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {pool.map((v, i) => (
                    <span
                      key={i}
                      className={`dice-roll${assignedIdxs.has(i) ? ' assigned' : ''}${dragging === i ? ' selected' : ''}`}
                      onClick={() => {
                        if (assignedIdxs.has(i)) return;
                        if (dragging !== null) { setDragging(null); return; }
                        setDragging(i);
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
                {dragging !== null && (
                  <p style={{ color: 'var(--gold)', fontSize: 12 }}>
                    Valor {pool[dragging]} selecionado — clique no atributo abaixo para atribuir.
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ALL_ATTRS.map((attr) => {
                    const idx = state.rolledAssignments[attr];
                    const val = idx !== undefined ? pool[idx] : null;
                    const total = val !== null ? getTotal(attr) : null;
                    const fixed = (fixedMods as Record<string, number>)[attr] ?? 0;
                    const variable = (varBonuses as Record<string, number>)[attr] ?? 0;
                    const raceMod = fixed + variable;
                    return (
                      <div
                        key={attr}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px',
                          background: dragging !== null ? 'var(--bg-card2)' : 'var(--surface2, rgba(255,255,255,0.04))',
                          borderRadius: 6,
                          cursor: dragging !== null ? 'pointer' : 'default',
                          border: dragging !== null ? '1px dashed var(--gold)' : '1px solid transparent',
                        }}
                        onClick={() => {
                          if (dragging !== null) { assignRoll(attr, dragging); setDragging(null); }
                        }}
                      >
                        <span style={{ flex: 1, fontSize: 13 }}>{ATTR_LABELS[attr]}</span>
                        {raceMod !== 0 && (
                          <span style={{ fontSize: 11, color: raceMod > 0 ? 'var(--success, #5ce65c)' : 'var(--danger)' }}>
                            {raceMod > 0 ? `+${raceMod}` : raceMod}
                          </span>
                        )}
                        {total !== null ? (
                          <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>
                            {total} <span style={{ fontSize: 11, color: 'var(--text2)' }}>({modStr(total)})</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text2)' }}>—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
