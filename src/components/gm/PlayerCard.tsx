import { useState } from 'react';
import { useStore } from '../../store';
import type { DeathStatus, VitalKey } from '../../types';
import { CONDITIONS, CONDITION_MAP } from '../../data/conditions';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import NPCSheetModal from './NPCSheetModal';

interface Props {
  characterName: string;
  isNPC?: boolean;
}

type ActiveVital = VitalKey;

export default function PlayerCard({ characterName, isNPC }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const campaign = useStore((s) => s.campaign);
  const updateVital = useStore((s) => s.updateVital);
  const toggleCondition = useStore((s) => s.toggleCondition);
  const addToast = useStore((s) => s.addToast);
  const toggleNPCInScene = useStore((s) => s.toggleNPCInScene);
  const releaseLevelUpFor = useStore((s) => s.releaseLevelUpFor);
  const rollDeathSave = useStore((s) => s.rollDeathSave);
  const forceStabilize = useStore((s) => s.forceStabilize);
  const revive = useStore((s) => s.revive);

  const [customDelta, setCustomDelta] = useState('');
  const [isHeal, setIsHeal] = useState(false);
  const [activeVital, setActiveVital] = useState<ActiveVital>('hp');
  const [showSheet, setShowSheet] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  if (!char || !campaign) return null;

  const deathState: DeathStatus = char.deathState ?? 'alive';
  const isDying = deathState === 'dying';
  const isStabilized = deathState === 'stabilized';
  const isDead = deathState === 'dead';
  const isIncapacitated = isDying || isStabilized || isDead;

  const applyDelta = (field: VitalKey, delta: number) => {
    updateVital(characterName, field, delta);
    const label = field === 'hp' ? 'PV' : 'Mana';
    if (delta < 0) addToast(`${char.name}: −${Math.abs(delta)} ${label}`, 'damage');
    else addToast(`${char.name}: +${delta} ${label}`, 'heal');
  };

  const applyCustom = () => {
    const val = parseInt(customDelta, 10);
    if (!val || isNaN(val)) return;
    applyDelta(activeVital, isHeal ? val : -val);
    setCustomDelta('');
  };

  const vitals = char.vitals;
  const hasMana = vitals.mana.max > 0;
  const activeConditions = char.conditions ?? [];

  const VITAL_OPTS: { key: VitalKey; label: string; color: string; show: boolean }[] = [
    { key: 'hp', label: 'PV', color: 'var(--hp)', show: true },
    { key: 'mana', label: 'Mana', color: 'var(--mana)', show: hasMana },
  ];

  return (
    <>
      <div className="gm-card" style={isNPC ? { borderLeft: '3px solid var(--mana)' } : undefined}>
        <div className="gm-card-header">
          <div className="flex-between">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 15, color: isNPC ? 'var(--mana)' : 'var(--gold)' }}>{char.name || characterName}</h3>
                {!isIncapacitated && char.pendingLevelUp && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
                    padding: '1px 6px', borderRadius: 10,
                    background: 'rgba(201,168,76,.2)', border: '1px solid rgba(201,168,76,.5)',
                    color: 'var(--gold)',
                  }}>
                    ⬆ LVL UP
                  </span>
                )}
                {!isIncapacitated && !isNPC && !char.pendingLevelUp && (
                  <button
                    className="btn btn-secondary btn-xs"
                    style={{ fontSize: 9, color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)', padding: '1px 6px' }}
                    onClick={() => releaseLevelUpFor(characterName)}
                    title="Liberar Level Up para este jogador"
                  >
                    ⬆ Liberar LVL
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                {[char.race, char.class].filter(Boolean).join(' · ')} · Nível {char.level}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
              {isNPC && (
                <button className="btn btn-secondary btn-xs" onClick={() => setShowSheet(true)}
                  title="Abrir ficha completa do NPC">
                  Ver Ficha
                </button>
              )}
              <Badge label="CA" value={vitals.ac} color="var(--gold)" />
              <Badge label="Desl." value={`${char.speed}q`} />
            </div>
          </div>
        </div>

        <div className="gm-card-body">
          {/* ── Death state banner ─────────────────────────────────────────── */}
          {isIncapacitated && (
            <div style={{
              marginBottom: 12, padding: '8px 12px', borderRadius: 6,
              background: isDead ? 'rgba(224,82,82,.15)' : 'rgba(224,82,82,.08)',
              border: `1px solid ${isDead ? 'var(--danger)' : 'rgba(224,82,82,.4)'}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{isDead ? '💀' : isStabilized ? '😴' : '🩸'}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDead ? 'var(--danger)' : 'var(--text)', letterSpacing: '.04em' }}>
                  {isDead ? 'MORTO' : isStabilized ? 'Estabilizado (inconsciente)' : `Caído — Sangrando (${vitals.hp.current} PV)`}
                </div>
                {isDying && (
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    Teste de Constituição CD 15 a cada turno
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vital bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <ProgressBar label="PV" current={Math.max(0, vitals.hp.current)} max={vitals.hp.max} color={isIncapacitated ? 'var(--danger)' : 'var(--hp)'} />
            {hasMana && (
              <ProgressBar label="Mana" current={vitals.mana.current} max={vitals.mana.max} color="var(--mana)" />
            )}
          </div>

          {/* Quick vital buttons */}
          <div style={{ marginBottom: 12 }}>
            {VITAL_OPTS.filter((v) => v.show).map((v) => (
              <div key={v.key} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: v.color, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {v.label}
                </div>
                <div className="vcontrols">
                  {[-5, -1].map((d) => (
                    <button key={d} className="vbtn dmg" onClick={() => applyDelta(v.key, d)} title={`${d}`}>{d}</button>
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--text2)', padding: '0 4px', minWidth: 50, textAlign: 'center' }}>
                    {vitals[v.key].current}/{vitals[v.key].max}
                  </span>
                  {[1, 5].map((d) => (
                    <button key={d} className="vbtn heal" onClick={() => applyDelta(v.key, d)} title={`+${d}`}>+{d}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom input */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Aplicar Dano / Cura</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={activeVital} onChange={(e) => setActiveVital(e.target.value as ActiveVital)}
                style={{ width: 72, fontSize: 12, padding: '4px 6px' }}>
                <option value="hp">PV</option>
                {hasMana && <option value="mana">Mana</option>}
              </select>
              <button className={`vbtn ${isHeal ? 'heal' : 'dmg'}`} onClick={() => setIsHeal(!isHeal)}
                title="Alternar dano/cura" style={{ width: 36 }}>
                {isHeal ? '+' : '−'}
              </button>
              <input type="number" min={0} value={customDelta}
                onChange={(e) => setCustomDelta(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
                placeholder="0" style={{ width: 70, textAlign: 'center', fontSize: 13 }} />
              <button className="btn btn-secondary btn-sm" onClick={applyCustom}>Aplicar</button>
            </div>
          </div>

          {/* ── Death action buttons ───────────────────────────────────────── */}
          {isIncapacitated && !isNPC && (
            <div style={{ background: 'var(--bg)', border: '1px solid rgba(224,82,82,.4)', borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--danger)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Ações de Morte
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {isDying && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, color: 'var(--text)' }}
                      onClick={() => rollDeathSave(characterName)}
                      title="Rolar d20 + mod. CON + nível/2 vs CD 15"
                    >
                      🎲 Rolar Teste CON (CD 15)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                      onClick={() => {
                        forceStabilize(characterName);
                        addToast(`${char.name} foi estabilizado pelo mestre.`, 'success');
                      }}
                      title="Forçar estabilização sem rolar dado"
                    >
                      ✋ Forçar Estabilização
                    </button>
                  </>
                )}
                {(isStabilized || isDead) && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, color: 'var(--success)', borderColor: 'rgba(82,201,122,.4)' }}
                    onClick={() => revive(characterName, 1)}
                    title="Ressuscitar com 1 PV"
                  >
                    ✨ Ressuscitar (1 PV)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conditions section */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
            <div className="flex-between" style={{ marginBottom: activeConditions.length > 0 || showConditionPicker ? 8 : 0 }}>
              <span style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Condições
                {activeConditions.length > 0 && (
                  <span style={{ marginLeft: 6, color: 'var(--hp)', fontWeight: 700 }}>{activeConditions.length}</span>
                )}
              </span>
              <button
                className="btn btn-secondary btn-xs"
                onClick={() => setShowConditionPicker(!showConditionPicker)}
                style={{ fontSize: 10 }}
              >
                {showConditionPicker ? 'Ocultar' : 'Editar'}
              </button>
            </div>

            {/* Active condition badges */}
            {activeConditions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: showConditionPicker ? 8 : 0 }}>
                {activeConditions.map((c) => (
                  <div key={c} className="condition-badge-wrapper">
                    <span className="condition-badge condition-badge--active">{c}</span>
                    <div className="condition-tooltip">{CONDITION_MAP[c]?.description ?? c}</div>
                  </div>
                ))}
              </div>
            )}

            {activeConditions.length === 0 && !showConditionPicker && (
              <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>Nenhuma</span>
            )}

            {/* Condition picker grid */}
            {showConditionPicker && (
              <div className="condition-picker">
                {CONDITIONS.map((cond) => {
                  const active = activeConditions.includes(cond.name);
                  return (
                    <div key={cond.name} className="condition-badge-wrapper">
                      <button
                        className={`condition-chip${active ? ' condition-chip--active' : ''}`}
                        onClick={() => toggleCondition(characterName, cond.name)}
                      >
                        {cond.name}
                      </button>
                      <div className="condition-tooltip condition-tooltip--above">{cond.description}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isNPC && (
            <>
              <hr className="div" />
              <button className="btn btn-secondary btn-sm w-full"
                style={{ fontSize: 11, color: 'var(--text2)' }}
                onClick={() => toggleNPCInScene(characterName)}>
                ✕ Remover da Cena
              </button>
            </>
          )}
        </div>
      </div>

      {showSheet && <NPCSheetModal character={char} onClose={() => setShowSheet(false)} />}
    </>
  );
}
