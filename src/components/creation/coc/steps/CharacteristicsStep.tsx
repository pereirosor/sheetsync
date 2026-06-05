import { useState } from 'react';
import {
  CHARACTERISTIC_DEFS,
  rollAllCharacteristics,
  quickstartCharacteristics,
  POINTBUY_TOTAL,
  CHAR_MIN,
  CHAR_MAX,
  calcHP,
  calcMP,
  calcSAN,
  calcMOV,
  getDamageBonus,
} from '../../../../systems/coc7e/characteristics';
import type { CoCWizardState, CoCCharGenMethod } from '../wizardState';

interface Props {
  state: CoCWizardState;
  update: (patch: Partial<CoCWizardState>) => void;
}

const CHAR_LABEL: Record<string, string> = {
  strength: 'Força (FOR)',
  constitution: 'Constituição (CON)',
  size: 'Tamanho (TAM)',
  dexterity: 'Destreza (DES)',
  appearance: 'Aparência (APA)',
  intelligence: 'Inteligência (INT)',
  power: 'Poder (POD)',
  education: 'Educação (EDU)',
};

const METHOD_LABELS: { id: CoCCharGenMethod; label: string; desc: string }[] = [
  { id: 'roll', label: 'Dados', desc: '3D6×5 ou 2D6+6×5 — resultado aleatório, pode re-rolar.' },
  { id: 'quickstart', label: 'Distribuição Rápida', desc: 'Distribua os valores 40, 50, 50, 50, 60, 60, 70, 80 livremente.' },
  { id: 'pointbuy', label: 'Compra de Pontos', desc: `Distribua ${POINTBUY_TOTAL} pontos. Cada característica: ${CHAR_MIN}–${CHAR_MAX}.` },
];

const QUICKSTART_POOL = [40, 50, 50, 50, 60, 60, 70, 80];

export default function CharacteristicsStep({ state, update }: Props) {
  const { charGenMethod, characteristics: ch } = state;
  const keys = CHARACTERISTIC_DEFS.map(d => d.key);

  // ── Roll method ──────────────────────────────────────────────────────────
  const handleRollAll = () => {
    update({ characteristics: rollAllCharacteristics(), lockedChars: {} });
  };
  const handleRollOne = (key: keyof typeof ch) => {
    const def = CHARACTERISTIC_DEFS.find(d => d.key === key)!;
    const val = key === 'size' || key === 'intelligence' || key === 'education'
      ? (rollD6() + rollD6() + 6) * 5
      : (rollD6() + rollD6() + rollD6()) * 5;
    update({ characteristics: { ...ch, [key]: val } });
    void def;
  };

  // ── Quickstart method ────────────────────────────────────────────────────
  const [qsAssignments, setQsAssignments] = useState<Record<string, number>>({});
  const usedValues = Object.values(qsAssignments);
  const remainingPool = QUICKSTART_POOL.filter((v, i) => {
    let count = 0;
    for (const val of usedValues) { if (val === v) count++; }
    return usedValues.filter(u => u === v).length < QUICKSTART_POOL.filter(p => p === v).length - count;
  });

  const handleQsAssign = (key: string, val: number) => {
    const next = { ...qsAssignments, [key]: val };
    if (val === 0) delete next[key];
    setQsAssignments(next);
    const charPatch = Object.fromEntries(keys.map(k => [k, next[k] ?? 0]));
    update({ characteristics: charPatch as unknown as typeof ch });
  };

  // ── Point-buy method ─────────────────────────────────────────────────────
  const pbTotal = Object.values(ch).reduce((s, v) => s + v, 0);
  const pbRemaining = POINTBUY_TOTAL - pbTotal;

  const handlePbChange = (key: keyof typeof ch, delta: number) => {
    const cur = ch[key];
    const next = Math.max(CHAR_MIN, Math.min(CHAR_MAX, cur + delta));
    if (delta > 0 && pbRemaining < delta) return;
    update({ characteristics: { ...ch, [key]: next } });
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const age = state.age || 25;
  const hp = calcHP(ch.constitution, ch.size);
  const mp = calcMP(ch.power);
  const san = calcSAN(ch.power);
  const mov = calcMOV(ch.strength, ch.dexterity, ch.size, age);
  const db = getDamageBonus(ch.strength, ch.size);
  const allFilled = keys.every(k => ch[k] > 0);

  return (
    <div>
      {/* Method selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {METHOD_LABELS.map(m => (
          <button
            key={m.id}
            className={`btn btn-sm ${charGenMethod === m.id ? 'btn-gold' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: 11, padding: '6px 4px' }}
            onClick={() => {
              const blank = m.id === 'pointbuy'
                ? { strength: CHAR_MIN, constitution: CHAR_MIN, size: CHAR_MIN, dexterity: CHAR_MIN, appearance: CHAR_MIN, intelligence: CHAR_MIN, power: CHAR_MIN, education: CHAR_MIN }
                : { strength: 0, constitution: 0, size: 0, dexterity: 0, appearance: 0, intelligence: 0, power: 0, education: 0 };
              update({ charGenMethod: m.id, characteristics: blank, lockedChars: {} });
              setQsAssignments({});
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 16 }}>
        {METHOD_LABELS.find(m => m.id === charGenMethod)?.desc}
      </p>

      {/* Roll method */}
      {charGenMethod === 'roll' && (
        <>
          <button className="btn btn-secondary w-full" style={{ marginBottom: 12 }} onClick={handleRollAll}>
            🎲 Rolar Todas as Características
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CHARACTERISTIC_DEFS.map(def => (
              <div key={def.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{CHAR_LABEL[def.key]}</span>
                <span style={{
                  width: 44, textAlign: 'center', fontWeight: 700, fontSize: 15,
                  color: ch[def.key] > 0 ? 'var(--text)' : 'var(--text3)',
                }}>
                  {ch[def.key] > 0 ? ch[def.key] : '—'}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={() => handleRollOne(def.key)}
                >
                  🎲
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quickstart method */}
      {charGenMethod === 'quickstart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text2)', marginRight: 4 }}>Disponíveis:</span>
            {QUICKSTART_POOL.map((v, i) => {
              const used = Object.values(qsAssignments).filter(u => u === v).length;
              const total = QUICKSTART_POOL.filter(p => p === v).length;
              const remaining = total - used;
              return remaining > 0 ? (
                <span key={i} style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 12,
                  background: 'var(--bg-card2)', border: '1px solid var(--border)',
                }}>
                  {v}
                </span>
              ) : null;
            })}
          </div>
          {CHARACTERISTIC_DEFS.map(def => {
            const assigned = qsAssignments[def.key] ?? 0;
            return (
              <div key={def.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{CHAR_LABEL[def.key]}</span>
                <select
                  value={assigned}
                  onChange={e => handleQsAssign(def.key, Number(e.target.value))}
                  style={{
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: 4, color: 'var(--text)', padding: '2px 6px', fontSize: 12,
                  }}
                >
                  <option value={0}>—</option>
                  {QUICKSTART_POOL.filter((v, _, arr) => {
                    const alreadyUsed = Object.entries(qsAssignments).filter(([k, u]) => k !== def.key && u === v).length;
                    const total = arr.filter(p => p === v).length;
                    return alreadyUsed < total;
                  }).filter((v, i, a) => a.indexOf(v) === i).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* Point-buy method */}
      {charGenMethod === 'pointbuy' && (
        <>
          <div style={{
            padding: '6px 12px', borderRadius: 6, marginBottom: 12, textAlign: 'center',
            background: pbRemaining === 0 ? 'rgba(76,175,80,.1)' : 'var(--bg-card2)',
            border: `1px solid ${pbRemaining === 0 ? 'var(--success)' : 'var(--border)'}`,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Pontos restantes: </span>
            <strong style={{ color: pbRemaining === 0 ? 'var(--success)' : 'var(--gold)' }}>
              {pbRemaining}
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CHARACTERISTIC_DEFS.map(def => (
              <div key={def.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{CHAR_LABEL[def.key]}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: 13 }}
                  onClick={() => handlePbChange(def.key, -5)}
                  disabled={ch[def.key] <= CHAR_MIN}
                >−</button>
                <span style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>
                  {ch[def.key]}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: 13 }}
                  onClick={() => handlePbChange(def.key, 5)}
                  disabled={ch[def.key] >= CHAR_MAX || pbRemaining < 5}
                >+</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Derived stats preview */}
      {allFilled && (
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 6,
          background: 'var(--bg-card2)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Atributos Derivados
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'PV', value: hp },
              { label: 'PM', value: mp },
              { label: 'SAN', value: san },
              { label: 'MOV', value: mov },
              { label: 'Bônus de Dano', value: db.damageBonus },
              { label: 'Construção', value: db.build },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function rollD6() { return Math.floor(Math.random() * 6) + 1; }
