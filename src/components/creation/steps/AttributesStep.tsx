import { useState } from 'react';
import tormenta20 from '../../../systems/tormenta20';
import type { AttributeKey } from '../../../types';
import {
  T20_ATTRS, MANUAL_MIN, MANUAL_MAX,
  EMPTY_ATTR_BASE, DEFAULT_MANUAL_ATTRS,
  getRaceMods, computeFinalAttributes, computeDerivedVitals,
  type AttributeMethod, type T20AttributeKey, type WizardState,
} from '../wizardState';

const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'Força', dexterity: 'Destreza', constitution: 'Constituição',
  intelligence: 'Inteligência', wisdom: 'Sabedoria', charisma: 'Carisma',
  size: 'Tamanho', power: 'Poder', appearance: 'Aparência', education: 'Educação',
};
const POINT_BUY_COST: Record<number, number> = { '-1': -1, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 };
const MAX_PTS = 10;
const MIN_BASE = -1;
const MAX_BASE = 4;

const METHOD_LABELS: { id: AttributeMethod; label: string; desc: string }[] = [
  { id: 'point-buy', label: 'Compra de Pontos', desc: 'Distribua 10 pontos. Base: –1 a +4 (cada +1 custa 1 ponto).' },
  { id: 'roll', label: 'Rolar 4d6', desc: 'Role 4d6 e descarte o menor, até 3 vezes. Atribua os resultados aos atributos.' },
  { id: 'manual', label: 'Manual', desc: 'Digite os valores finais da ficha de papel. Os modificadores raciais NÃO serão somados.' },
];

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
  const raceMods = getRaceMods(state);
  const finals = computeFinalAttributes(state);
  const getTotal = (attr: T20AttributeKey) => finals[attr];

  const ptSpent = T20_ATTRS.reduce((sum, a) => sum + (POINT_BUY_COST[state.attributesBase[a]] ?? 0), 0);
  const ptLeft = MAX_PTS - ptSpent;

  const setBase = (attr: T20AttributeKey, val: number) => {
    if (val < MIN_BASE || val > MAX_BASE) return;
    const newBases = { ...state.attributesBase, [attr]: val };
    const newSpent = T20_ATTRS.reduce((sum, a) => sum + (POINT_BUY_COST[newBases[a]] ?? 0), 0);
    if (newSpent > MAX_PTS) return;
    update({ attributesBase: newBases });
  };

  const pool = state.rolledPool.length > 0 ? state.rolledPool : pendingPool;
  const assignedIdxs = new Set(Object.values(state.rolledAssignments));

  const MAX_ROLLS = 3;

  const rollAll = () => {
    if (state.rollAttempts >= MAX_ROLLS) return;
    const newPool = T20_ATTRS.map(() => roll4d6Drop());
    setPendingPool(newPool);
    update({
      rolledPool: newPool, rolledAssignments: {},
      attributesBase: { ...EMPTY_ATTR_BASE },
      rollAttempts: state.rollAttempts + 1,
    });
  };

  const modSum = pool.reduce((s, v) => s + calcMod(v), 0);
  const canRerollLowest = pool.length > 0 && modSum < 6;

  const rerollLowest = () => {
    if (!canRerollLowest) return;
    let lowestIdx = 0;
    for (let i = 1; i < pool.length; i++) {
      if (pool[i] < pool[lowestIdx]) lowestIdx = i;
    }
    const newPool = [...pool];
    newPool[lowestIdx] = roll4d6Drop();
    const newBases = { ...state.attributesBase };
    for (const [a, idx] of Object.entries(state.rolledAssignments) as [T20AttributeKey, number][]) {
      newBases[a] = (newPool[idx] ?? 10) - 10;
    }
    setPendingPool(newPool);
    update({ rolledPool: newPool, attributesBase: newBases });
  };

  const assignRoll = (attr: T20AttributeKey, poolIdx: number) => {
    const prev = { ...state.rolledAssignments };
    const oldIdx = Object.entries(prev).find(([, v]) => v === poolIdx)?.[0] as T20AttributeKey | undefined;
    if (oldIdx) delete prev[oldIdx];
    prev[attr] = poolIdx;
    const newBases: Record<AttributeKey, number> = { ...EMPTY_ATTR_BASE };
    for (const [a, idx] of Object.entries(prev) as [T20AttributeKey, number][]) {
      newBases[a] = (pool[idx] ?? 10) - 10;
    }
    update({ rolledAssignments: prev, attributesBase: newBases });
  };

  const selectMethod = (m: AttributeMethod) => {
    // Reclicar o método já ativo não pode zerar o que o usuário digitou/rolou.
    if (m === state.attributeMethod) return;
    setPendingPool([]);
    setDragging(null);
    update({
      attributeMethod: m,
      attributesBase: { ...EMPTY_ATTR_BASE },
      rolledPool: [],
      rolledAssignments: {},
      attributesManual: { ...DEFAULT_MANUAL_ATTRS },
    });
  };

  const setManual = (attr: T20AttributeKey, raw: string) => {
    if (raw === '') { update({ attributesManual: { ...state.attributesManual, [attr]: 0 } }); return; }
    if (!/^\d{1,2}$/.test(raw)) return;
    const n = Number(raw);
    if (n > MANUAL_MAX) return;
    update({ attributesManual: { ...state.attributesManual, [attr]: n } });
  };

  const derived = computeDerivedVitals(state, 1);
  const raceBonusEntries = Object.entries(state.raceBonusChoices ?? {}) as [T20AttributeKey, number][];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {METHOD_LABELS.map((m) => (
          <button
            key={m.id}
            className={`btn btn-sm ${state.attributeMethod === m.id ? 'btn-gold' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: 11, padding: '6px 4px' }}
            onClick={() => selectMethod(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: -8 }}>
        {METHOD_LABELS.find((m) => m.id === state.attributeMethod)?.desc}
      </p>

      {state.attributeMethod === 'point-buy' && (
        <>
          <div className="wizard-info-card" style={{ textAlign: 'center' }}>
            <span style={{ color: ptLeft < 0 ? 'var(--danger)' : 'var(--gold)', fontWeight: 700, fontSize: 18 }}>
              {ptLeft}
            </span>
            <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 6 }}>pontos restantes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {T20_ATTRS.map((attr) => {
              const base = state.attributesBase[attr];
              const total = getTotal(attr);
              const raceMod = raceMods[attr];
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
          <button
            className="btn btn-gold"
            onClick={rollAll}
            disabled={state.rollAttempts >= MAX_ROLLS}
          >
            {state.rollAttempts >= MAX_ROLLS
              ? `Rolagens esgotadas (${MAX_ROLLS}/${MAX_ROLLS})`
              : state.rollAttempts === 0 ? 'Rolar 4d6 (descarta menor)' : 'Rolar novamente'}
          </button>

          <div className="wizard-info-card" style={{ textAlign: 'center', fontSize: 13 }}>
            {state.rollAttempts === 0 && (
              <span style={{ color: 'var(--text2)' }}>
                Você tem <b style={{ color: 'var(--gold)' }}>{MAX_ROLLS} rolagens</b> disponíveis.
                Use com cuidado — o jogo mantém apenas o último conjunto.
              </span>
            )}
            {state.rollAttempts === 1 && (
              <span style={{ color: 'var(--text2)' }}>Rolagem <b>1 de {MAX_ROLLS}</b></span>
            )}
            {state.rollAttempts === 2 && (
              <span>
                <span style={{ color: 'var(--text2)' }}>Rolagem <b>2 de {MAX_ROLLS}</b></span>
                <span style={{ display: 'block', marginTop: 4, color: 'var(--warning, #e0a020)' }}>
                  ⚠ Atenção: a próxima será sua última rolagem possível.
                </span>
              </span>
            )}
            {state.rollAttempts === 3 && (
              <span style={{ color: 'var(--danger)' }}>
                <b>Rolagem 3 de {MAX_ROLLS}</b> — você usou todas as rolagens. O conjunto atual é definitivo.
              </span>
            )}
          </div>

          {pool.length > 0 && (
            <>
              <div className="wizard-info-card" style={{ background: canRerollLowest ? 'rgba(224,160,32,0.08)' : undefined }}>
                <p style={{ fontSize: 12, marginBottom: canRerollLowest ? 6 : 0 }}>
                  Soma dos modificadores:{' '}
                  <b style={{ color: modSum < 6 ? 'var(--warning, #e0a020)' : 'var(--success, #5ce65c)' }}>
                    {modSum >= 0 ? `+${modSum}` : modSum}
                  </b>
                  {modSum < 6 && <span style={{ color: 'var(--text2)', marginLeft: 8 }}>(precisa ≥ +6)</span>}
                </p>
                {canRerollLowest && (
                  <>
                    <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                      Regra T20: como a soma dos modificadores é menor que +6, você pode rolar novamente o menor valor.
                    </p>
                    <button className="btn btn-secondary btn-sm" onClick={rerollLowest}>
                      🎲 Rolar o menor ({Math.min(...pool)})
                    </button>
                  </>
                )}
              </div>

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
                  {T20_ATTRS.map((attr) => {
                    const idx = state.rolledAssignments[attr];
                    const val = idx !== undefined ? pool[idx] : null;
                    const total = val !== null ? getTotal(attr) : null;
                    const raceMod = raceMods[attr];
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

      {state.attributeMethod === 'manual' && (
        <>
          {state.race && (
            <div className="wizard-info-card">
              <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
                Modificadores de {state.race} — apenas referência
              </p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                {raceInfo?.attributeBonuses ?? 'Sem modificadores fixos.'}
                {raceBonusEntries.length > 0 && (
                  <>
                    {' '}— escolhidos: {raceBonusEntries.map(([a]) => ATTR_LABELS[a]).join(', ')} (+2 cada)
                  </>
                )}
              </p>
              <p style={{ fontSize: 11, color: 'var(--warning, #e0a020)', marginTop: 6, fontWeight: 600 }}>
                Estes modificadores NÃO serão somados. Digite os valores finais, já com os bônus raciais inclusos.
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                As escolhas de +2 da raça continuam registradas na ficha, mas não alteram os valores digitados.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {T20_ATTRS.map((attr) => {
              const val = state.attributesManual[attr];
              const raceMod = raceMods[attr];
              return (
                <div key={attr} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{ATTR_LABELS[attr]}</span>
                  {raceMod !== 0 && (
                    <span
                      style={{ fontSize: 11, color: 'var(--text2)', textDecoration: 'line-through', width: 36, textAlign: 'center' }}
                      title="Modificador racial não aplicado"
                    >
                      {raceMod > 0 ? `+${raceMod}` : raceMod}
                    </span>
                  )}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MANUAL_MIN}
                    max={MANUAL_MAX}
                    value={val === 0 ? '' : val}
                    onChange={(e) => setManual(attr, e.target.value)}
                    style={{ width: 64, textAlign: 'center', fontSize: 14, fontWeight: 600 }}
                    placeholder="—"
                  />
                  <span style={{ width: 40, textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>
                    {val > 0 ? modStr(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {derived && (
        <div style={{
          padding: '12px 16px', borderRadius: 6,
          background: 'var(--bg-card2)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Prévia (nível 1)
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>PV</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{derived.hpMax}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>Mana</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{derived.manaMax}</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
            Ajuste PV/Mana na ficha depois de finalizar, se necessário.
          </p>
        </div>
      )}
    </div>
  );
}
