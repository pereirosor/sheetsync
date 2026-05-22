import tormenta20 from '../../../systems/tormenta20';
import type { Character } from '../../../types';
import type { LevelUpState } from '../levelUpState';

interface Props {
  char: Character;
  newLevel: number;
  state: LevelUpState;
  update: (patch: Partial<LevelUpState>) => void;
  spellsToLearn: number;
}

export default function LearnSpellsStep({ char, newLevel, state, update, spellsToLearn }: Props) {
  const cp = tormenta20.casterProgression[char.class];
  const magicType = tormenta20.classMagicType[char.class];
  if (!cp || !magicType) return null;

  const maxCircle = Math.max(
    ...Object.entries(cp.circleAtLevel)
      .filter(([lvl]) => Number(lvl) <= newLevel)
      .map(([, c]) => c),
    0
  );

  const knownSpellNames = new Set(char.spells.map((s) => s.name));
  const picked = state.chosenSpells;

  const available = Object.entries(tormenta20.spellData)
    .filter(([name, spell]) => {
      if (spell.spellType !== magicType) return false;
      if (spell.circle > maxCircle) return false;
      if (knownSpellNames.has(name)) return false;
      return true;
    })
    .map(([name, spell]) => ({ name, spell }))
    .sort((a, b) => a.spell.circle - b.spell.circle || a.name.localeCompare(b.name));

  const toggle = (name: string) => {
    if (picked.includes(name)) {
      update({ chosenSpells: picked.filter((n) => n !== name) });
    } else if (picked.length < spellsToLearn) {
      update({ chosenSpells: [...picked, name] });
    }
  };

  const newCircleEntry = Object.entries(cp.circleAtLevel).find(
    ([lvl, c]) => Number(lvl) === newLevel && c > (cp.circleAtLevel[newLevel - 1] ?? 0)
  );
  const newCircleUnlocked = newCircleEntry ? Number(newCircleEntry[1]) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        Escolha {spellsToLearn} magia{spellsToLearn !== 1 ? 's' : ''} novas para aprender.
        Círculos disponíveis até o {maxCircle}º.
        {newCircleUnlocked && (
          <span style={{ color: 'var(--mana)' }}> Você desbloqueou o {newCircleUnlocked}º círculo neste nível!</span>
        )}
      </p>

      <div style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'right' }}>
        {picked.length}/{spellsToLearn} selecionadas
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {available.map(({ name, spell }) => {
          const sel = picked.includes(name);
          const disabled = !sel && picked.length >= spellsToLearn;
          return (
            <label
              key={name}
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '7px 10px', background: 'var(--bg)',
                border: `1px solid ${sel ? 'rgba(147,112,219,.6)' : 'var(--border)'}`,
                borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={sel}
                disabled={disabled}
                onChange={() => toggle(name)}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong style={{ fontSize: 12, color: sel ? 'var(--mana)' : 'var(--text)' }}>{name}</strong>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>{spell.circle}º círculo · {spell.school}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3, lineHeight: 1.45 }}>
                  {spell.description.slice(0, 120)}{spell.description.length > 120 ? '...' : ''}
                </p>
              </div>
            </label>
          );
        })}
        {available.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', textAlign: 'center', padding: 16 }}>
            Nenhuma magia disponível para aprender.
          </p>
        )}
      </div>
    </div>
  );
}
