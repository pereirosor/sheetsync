import tormenta20 from '../../../systems/tormenta20';
import type { Character } from '../../../types';
import type { LevelUpState } from '../levelUpState';

interface Props {
  char: Character;
  powerName: string;
  state: LevelUpState;
  update: (patch: Partial<LevelUpState>) => void;
}

export default function GrantSkillStep({ char, powerName, state, update }: Props) {
  const power = tormenta20.generalPowers.find((p) => p.name === powerName);
  const grant = power?.grantsSkillTraining;
  if (!grant) return null;

  const pool = grant.options
    ? tormenta20.skillList.filter((s) => grant.options!.includes(s.id))
    : tormenta20.skillList;

  const available = pool.filter((s) => !(char.skills[s.id] ?? false));
  const needed = grant.count;
  const selected = state.grantedSkills;
  const full = selected.length >= needed;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      update({ grantedSkills: selected.filter((s) => s !== id) });
    } else if (!full) {
      update({ grantedSkills: [...selected, id] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--gold)' }}>{powerName}</strong> concede treinamento em{' '}
        {needed === 1 ? 'uma perícia' : `${needed} perícias`} a sua escolha.
        {grant.options && ' Apenas perícias elegíveis são exibidas.'}
      </p>

      <p style={{ fontSize: 12, color: 'var(--text3)' }}>
        {selected.length}/{needed} selecionada{needed !== 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
        {available.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>
            Nenhuma perícia disponível (todas já treinadas).
          </p>
        )}
        {available.map((skill) => {
          const checked = selected.includes(skill.id);
          const disabled = !checked && full;
          return (
            <label
              key={skill.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6,
                background: checked ? 'rgba(201,168,76,.12)' : 'var(--bg-card2)',
                border: checked ? '1px solid rgba(201,168,76,.4)' : '1px solid transparent',
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(skill.id)}
              />
              <span style={{ fontSize: 13 }}>{skill.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
