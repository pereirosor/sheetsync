import { useStore } from '../../store';
import tormenta20, { calcMod2 } from '../../systems/tormenta20';

interface Props {
  characterName: string;
}

const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau',
];

export default function IdentityTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

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
    if (!cd) { upd('class', newClass); return; }
    const conMod = calcMod2(char.attributes.constitution);
    const lvl = char.level;
    const newHpMax = cd.hpBase + lvl * conMod + (lvl - 1) * cd.hpPerLevel;
    const newManaMax = cd.mpPerLevel * lvl;
    updateCharacter(characterName, {
      class: newClass,
      vitals: {
        ...char.vitals,
        hp: { current: Math.min(char.vitals.hp.current, newHpMax), max: newHpMax },
        mana: { current: Math.min(char.vitals.mana.current, newManaMax), max: newManaMax },
      },
    } as never);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="g3">
        <div className="form-row">
          <label>Nome</label>
          <input value={char.name} onChange={(e) => upd('name', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Raça</label>
          <select value={char.race} onChange={(e) => handleRaceChange(e.target.value)}>
            <option value="">— Selecione —</option>
            {tormenta20.raceList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Classe</label>
          <select value={char.class} onChange={(e) => handleClassChange(e.target.value)}>
            <option value="">— Selecione —</option>
            {tormenta20.classList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
          </>
        );
      })()}

      <div className="g3">
        <div className="form-row">
          <label>Origem</label>
          <select value={char.origin} onChange={(e) => updateCharacter(characterName, { origin: e.target.value, originBenefits: [] } as never)}>
            <option value="">— Selecione —</option>
            {tormenta20.originList.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Nível</label>
          <input
            type="number" min={1} max={20} value={char.level}
            onChange={(e) => upd('level', Number(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label>Tendência</label>
          <select value={char.alignment} onChange={(e) => upd('alignment', e.target.value)}>
            <option value="">— Selecione —</option>
            {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {(char.origin && tormenta20.originData[char.origin]) && (() => {
        const benefits = tormenta20.originData[char.origin];
        const selected: string[] = char.originBenefits ?? [];
        const toggle = (b: string) => {
          const next = selected.includes(b)
            ? selected.filter((x) => x !== b)
            : selected.length < 2 ? [...selected, b] : selected;
          upd('originBenefits', next);
        };
        return (
          <div style={{ fontSize: '0.85rem', padding: '6px 10px', background: 'var(--surface2, rgba(255,255,255,0.04))', borderRadius: 6 }}>
            <b style={{ display: 'block', marginBottom: 2 }}>Benefícios de Origem</b>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              Escolha 2 ({selected.length}/2 marcados)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {benefits.map((b) => {
                const checked = selected.includes(b);
                const disabled = !checked && selected.length >= 2;
                return (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
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

      <div className="g3">
        <div className="form-row">
          <label>Divindade</label>
          <select value={char.deity} onChange={(e) => upd('deity', e.target.value)}>
            <option value="">— Selecione —</option>
            {tormenta20.deityList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
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

      <hr className="div" />
      <p className="sec-title">Estatísticas Vitais</p>

      <div className="g3">
        <div className="form-row">
          <label>PV Máximo</label>
          <input
            type="number" min={0} value={char.vitals.hp.max}
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
            type="number" min={0} max={char.vitals.hp.max} value={char.vitals.hp.current}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, hp: { ...char.vitals.hp, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>Classe de Armadura</label>
          <input
            type="number" min={0} value={char.vitals.ac}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, ac: Number(e.target.value) },
              });
            }}
          />
        </div>
      </div>

      <div className="g2">
        <div className="form-row">
          <label>Mana Máxima</label>
          <input
            type="number" min={0} value={char.vitals.mana.max}
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
            type="number" min={0} max={char.vitals.mana.max} value={char.vitals.mana.current}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, mana: { ...char.vitals.mana, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
