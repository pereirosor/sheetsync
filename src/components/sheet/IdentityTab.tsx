import { useStore } from '../../store';
import tormenta20, { calcMod2 } from '../../systems/tormenta20';
import { resolveSkillId } from '../../utils/resolveSkillId';

interface Props {
  characterName: string;
  readOnly?: boolean;
}

const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau',
];

export default function IdentityTab({ characterName, readOnly }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const storeUpdate = useStore((s) => s.updateCharacter);

  if (!char) return null;

  // Guard central: em modo leitura nenhuma das escritas desta aba pode persistir
  // (updateCharacter grava no Supabase e faz broadcast para o jogador).
  const updateCharacter: typeof storeUpdate = (name, patch) => {
    if (readOnly) return;
    storeUpdate(name, patch);
  };

  const locked = !!char.created || !!readOnly;

  const upd = (field: string, value: unknown) =>
    updateCharacter(characterName, { [field]: value } as never);

  const handleRaceChange = (newRace: string) => {
    const oldMods = tormenta20.raceData[char.race]?.attributeMods;
    const newMods = tormenta20.raceData[newRace]?.attributeMods;
    const newAttrs = { ...char.attributes };
    if (oldMods) {
      for (const [k, v] of Object.entries(oldMods) as [string, number][])
        (newAttrs as Record<string, number>)[k] -= v;
    }
    if (newMods) {
      for (const [k, v] of Object.entries(newMods) as [string, number][])
        (newAttrs as Record<string, number>)[k] += v;
    }
    const updates: Record<string, unknown> = { race: newRace, attributes: newAttrs };
    const cd = tormenta20.classData[char.class];
    if (cd) {
      const conMod = calcMod2(newAttrs.constitution);
      const lvl = char.level;
      const newHpMax = cd.hpBase + lvl * conMod + (lvl - 1) * cd.hpPerLevel;
      updates.vitals = {
        ...char.vitals,
        hp: { current: Math.min(char.vitals.hp.current, newHpMax), max: newHpMax },
      };
    }
    updateCharacter(characterName, updates as never);
  };

  const handleClassChange = (newClass: string) => {
    const cd = tormenta20.classData[newClass];
    const originSkillIds = new Set(
      (char.originBenefits ?? []).map(resolveSkillId).filter(Boolean) as string[]
    );
    const newSkills = { ...char.skills };
    const oldCd = tormenta20.classData[char.class];
    if (oldCd) {
      for (const id of oldCd.trainedSkills) {
        if (!originSkillIds.has(id)) newSkills[id] = false;
      }
      for (const group of oldCd.skillChoices) {
        for (const id of group.options) {
          if (!originSkillIds.has(id)) newSkills[id] = false;
        }
      }
    }
    if (cd) {
      for (const id of cd.trainedSkills) newSkills[id] = true;
    }
    if (!cd) { updateCharacter(characterName, { class: newClass, skills: newSkills } as never); return; }
    const conMod = calcMod2(char.attributes.constitution);
    const lvl = char.level;
    const newHpMax = cd.hpBase + lvl * conMod + (lvl - 1) * cd.hpPerLevel;
    const newManaMax = cd.mpPerLevel * lvl;
    updateCharacter(characterName, {
      class: newClass,
      skills: newSkills,
      vitals: {
        ...char.vitals,
        hp: { current: Math.min(char.vitals.hp.current, newHpMax), max: newHpMax },
        mana: { current: Math.min(char.vitals.mana.current, newManaMax), max: newManaMax },
      },
    } as never);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Nome — largura total */}
      <div className="form-row">
        <label>Nome</label>
        <input value={char.name} onChange={(e) => upd('name', e.target.value)} />
      </div>

      {/* Linha 1: Raça | Classe */}
      <div className="g2">
        <div className="form-row">
          <label>Raça {locked && <span className="locked-badge">fixado</span>}</label>
          {locked ? (
            <span className="locked-value">{char.race}</span>
          ) : (
            <select value={char.race} onChange={(e) => handleRaceChange(e.target.value)}>
              <option value="">— Selecione —</option>
              {tormenta20.raceList.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
        </div>
        <div className="form-row">
          <label>Classe {locked && <span className="locked-badge">fixado</span>}</label>
          {locked ? (
            <span className="locked-value">{char.class}{char.classPath ? ` (${char.classPath})` : ''}</span>
          ) : (
            <select value={char.class} onChange={(e) => handleClassChange(e.target.value)}>
              <option value="">— Selecione —</option>
              {tormenta20.classList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {(char.race && tormenta20.raceData[char.race]) && (
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, padding: '6px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
          <b>Bônus:</b> {tormenta20.raceData[char.race].attributeBonuses}<br />
          <b>Habilidades:</b> {tormenta20.raceData[char.race].abilities.join(' · ')}
        </div>
      )}

      {(char.class && tormenta20.classData[char.class]) && (() => {
        const cd = tormenta20.classData[char.class];
        const gained = cd.abilities.filter((a) => a.level <= char.level);
        return (
          <>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, padding: '6px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
              <b>PV:</b> {cd.hpBase}+Con (+{cd.hpPerLevel}/nível) &nbsp;
              <b>PM:</b> {cd.mpPerLevel}/nível<br />
              <b>Proficiências:</b> {cd.proficiencies}
            </div>
            {gained.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p className="sec-title">Habilidades de Classe</p>
                {gained.map((a) => (
                  <div key={`${a.level}-${a.name}`} style={{ fontSize: '0.82rem', lineHeight: 1.5, padding: '5px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Nível {a.level}</span><br />
                    <b>{a.name}</b><br />
                    <span style={{ color: 'var(--muted)' }}>{a.description}</span>
                  </div>
                ))}
              </div>
            )}

            {(char.powers ?? []).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p className="sec-title">Poderes & Talentos</p>
                {(char.powers ?? []).map((pw) => {
                  const def = tormenta20.generalPowers.find((p) => p.name === pw.name);
                  return (
                    <div key={`${pw.name}-${pw.level}`} style={{ fontSize: '0.82rem', lineHeight: 1.5, padding: '5px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
                      <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Nível {pw.level} · {def?.group ?? 'Geral'}</span><br />
                      <b>{pw.name}</b><br />
                      {def && <span style={{ color: 'var(--muted)' }}>{def.description}</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {cd.skillChoices.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p className="sec-title">Perícias de Classe</p>
                {cd.skillChoices.map((group, gi) => {
                  const groupChecked = group.options.filter((id) => !!char.skills[id]);
                  const full = groupChecked.length >= group.count;
                  return (
                    <div key={gi} style={{ fontSize: '0.85rem', padding: '6px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
                      <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                        Escolha {group.count} ({groupChecked.length}/{group.count} marcados)
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                        {group.options.map((id) => {
                          const skill = tormenta20.skillList.find((s) => s.id === id);
                          const checked = !!char.skills[id];
                          const disabled = !checked && full;
                          return (
                            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => {
                                  if (checked) {
                                    const inOrigin = (char.originBenefits ?? []).some((b) => resolveSkillId(b) === id);
                                    if (!inOrigin) upd('skills', { ...char.skills, [id]: false });
                                  } else {
                                    upd('skills', { ...char.skills, [id]: true });
                                  }
                                }}
                              />
                              {skill?.name ?? id}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {/* Linha 2: Origem | Nível */}
      <div className="g2">
        <div className="form-row">
          <label>Origem {locked && <span className="locked-badge">fixado</span>}</label>
          {locked ? (
            <span className="locked-value">{char.origin}</span>
          ) : (
            <select value={char.origin} onChange={(e) => updateCharacter(characterName, { origin: e.target.value, originBenefits: [] } as never)}>
              <option value="">— Selecione —</option>
              {tormenta20.originList.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
        </div>
        <div className="form-row">
          <label>Nível</label>
          <input
            type="number" min={1} max={20} value={char.level}
            onChange={(e) => upd('level', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Linha 3: Tendência | Divindade */}
      <div className="g2">
        <div className="form-row">
          <label>Tendência</label>
          <select value={char.alignment} onChange={(e) => upd('alignment', e.target.value)}>
            <option value="">— Selecione —</option>
            {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Divindade</label>
          <select value={char.deity} onChange={(e) => upd('deity', e.target.value)}>
            <option value="">— Selecione —</option>
            {tormenta20.deityList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Linha 4: Tamanho | Deslocamento */}
      <div className="g2">
        <div className="form-row">
          <label>Tamanho</label>
          <select value={char.size} onChange={(e) => upd('size', e.target.value)}>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Deslocamento (quadrados)</label>
          <input
            type="number" min={0} value={char.speed}
            onChange={(e) => upd('speed', Number(e.target.value))}
          />
        </div>
      </div>

      {(char.origin && tormenta20.originData[char.origin]) && (() => {
        const benefits = tormenta20.originData[char.origin];
        const selected: string[] = char.originBenefits ?? [];
        const toggle = (b: string) => {
          if (locked) return;
          const isChecking = !selected.includes(b) && selected.length < 2;
          const isUnchecking = selected.includes(b);
          if (!isChecking && !isUnchecking) return;
          const next = isUnchecking
            ? selected.filter((x) => x !== b)
            : [...selected, b];
          const skillId = resolveSkillId(b);
          const updates: Record<string, unknown> = { originBenefits: next };
          if (skillId) {
            const classSkills = tormenta20.classData[char.class]?.trainedSkills ?? [];
            if (isChecking) {
              updates.skills = { ...char.skills, [skillId]: true };
            } else if (!classSkills.includes(skillId)) {
              updates.skills = { ...char.skills, [skillId]: false };
            }
          }
          updateCharacter(characterName, updates as never);
        };
        return (
          <div style={{ fontSize: '0.85rem', padding: '6px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
            <b style={{ display: 'block', marginBottom: 2 }}>
              Benefícios de Origem
              {locked && <span className="locked-badge" style={{ marginLeft: 6 }}>fixado</span>}
            </b>
            {!locked && (
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                Escolha 2 ({selected.length}/2 marcados)
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {benefits.map((b) => {
                const checked = selected.includes(b);
                const disabled = locked || (!checked && selected.length >= 2);
                return (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: locked ? (checked ? 1 : 0.3) : (disabled ? 0.4 : 1), cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(b)}
                    />
                    {b}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })()}

      <hr className="div" />
      <p className="sec-title">Estatísticas Vitais</p>

      <div className="g2">
        <div className="form-row">
          <label>PV Máximo</label>
          <input
            type="number" min={0} value={char.vitals.hp.max} readOnly={readOnly}
            onChange={(e) => {
              const max = Number(e.target.value);
              updateCharacter(characterName, {
                vitals: { ...char.vitals, hp: { current: Math.min(char.vitals.hp.current, max), max } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>PV Atual</label>
          <input
            type="number" min={0} max={char.vitals.hp.max} value={char.vitals.hp.current} readOnly={readOnly}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, hp: { ...char.vitals.hp, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
      </div>

      <div className="g2">
        <div className="form-row">
          <label>Mana Máxima</label>
          <input
            type="number" min={0} value={char.vitals.mana.max} readOnly={readOnly}
            onChange={(e) => {
              const max = Number(e.target.value);
              updateCharacter(characterName, {
                vitals: { ...char.vitals, mana: { current: Math.min(char.vitals.mana.current, max), max } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>Mana Atual</label>
          <input
            type="number" min={0} max={char.vitals.mana.max} value={char.vitals.mana.current} readOnly={readOnly}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, mana: { ...char.vitals.mana, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Classe de Armadura</label>
        <input
          type="number" min={0} value={char.vitals.ac} readOnly={readOnly}
          onChange={(e) => {
            updateCharacter(characterName, {
              vitals: { ...char.vitals, ac: Number(e.target.value) },
            });
          }}
        />
      </div>
    </div>
  );
}
