import { useState } from 'react';
import tormenta20 from '../../../systems/tormenta20';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function SpellsStep({ state, update }: Props) {
  const [search, setSearch] = useState('');
  const magicType = tormenta20.classMagicType[state.charClass];
  const maxSpells = tormenta20.classStartingSpells[state.charClass] ?? 0;

  const availableSpells = Object.entries(tormenta20.spellData)
    .filter(([, s]) => (s.spellType === magicType || s.spellType === 'universal') && s.circle === 1)
    .filter(([name]) => !search || name.toLowerCase().includes(search.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  const toggleSpell = (name: string) => {
    if (state.spellsPicked.includes(name)) {
      update({ spellsPicked: state.spellsPicked.filter((s) => s !== name) });
    } else if (state.spellsPicked.length < maxSpells) {
      update({ spellsPicked: [...state.spellsPicked, name] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="wizard-info-card" style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>{state.spellsPicked.length}/{maxSpells}</span>
        <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 8 }}>
          magias de 1º círculo {magicType === 'arcana' ? 'arcanas' : 'divinas'}
        </span>
      </div>

      <input
        placeholder="Buscar magia..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border, #333)', background: 'var(--bg-card2)', color: 'var(--text)' }}
      />

      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {availableSpells.map(([name, spell]) => {
          const picked = state.spellsPicked.includes(name);
          const disabled = !picked && state.spellsPicked.length >= maxSpells;
          return (
            <label
              key={name}
              style={{
                display: 'flex', flexDirection: 'column', padding: '8px 10px',
                background: picked ? 'rgba(var(--gold-rgb, 212,175,55), 0.12)' : 'var(--surface2, rgba(255,255,255,0.04))',
                borderRadius: 6,
                border: picked ? '1px solid var(--gold)' : '1px solid transparent',
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={picked}
                  disabled={disabled}
                  onChange={() => toggleSpell(name)}
                />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 'auto' }}>{spell.school}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5, marginLeft: 22 }}>
                {spell.description.slice(0, 120)}{spell.description.length > 120 ? '...' : ''}
              </p>
            </label>
          );
        })}
        {availableSpells.length === 0 && (
          <p style={{ color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Nenhuma magia encontrada.
          </p>
        )}
      </div>
    </div>
  );
}
