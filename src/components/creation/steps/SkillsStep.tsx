import tormenta20 from '../../../systems/tormenta20';
import { resolveSkillId } from '../../../utils/resolveSkillId';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function SkillsStep({ state, update }: Props) {
  const cd = tormenta20.classData[state.charClass];
  if (!cd) return null;

  const originSkillIds = new Set(
    state.originBenefits.map(resolveSkillId).filter(Boolean) as string[]
  );

  const toggleSkill = (id: string, groupIdx: number) => {
    const group = cd.skillChoices[groupIdx];
    const groupSelected = state.skillChoices.filter((s) => group.options.includes(s));
    if (state.skillChoices.includes(id)) {
      if (!originSkillIds.has(id)) {
        update({ skillChoices: state.skillChoices.filter((s) => s !== id) });
      }
    } else {
      if (groupSelected.length < group.count) {
        update({ skillChoices: [...state.skillChoices, id] });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {cd.trainedSkills.length > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Perícias treinadas automaticamente (locked)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cd.trainedSkills.map((id) => {
              const sk = tormenta20.skillList.find((s) => s.id === id);
              return (
                <span key={id} className="wizard-tag" style={{ background: 'var(--gold)', color: '#000' }}>
                  {sk?.name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {originSkillIds.size > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Perícias da Origem</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...originSkillIds].map((id) => {
              const sk = tormenta20.skillList.find((s) => s.id === id);
              return (
                <span key={id} className="wizard-tag" style={{ background: 'var(--muted)', color: 'var(--text)' }}>
                  {sk?.name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {cd.skillChoices.map((group, gi) => {
        const groupSelected = state.skillChoices.filter((s) => group.options.includes(s));
        const full = groupSelected.length >= group.count;
        return (
          <div key={gi} className="wizard-info-card">
            <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
              Escolha {group.count} perícia{group.count > 1 ? 's' : ''}
              <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: 8 }}>
                ({groupSelected.length}/{group.count})
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.options.map((id) => {
                const sk = tormenta20.skillList.find((s) => s.id === id);
                const isAutoTrained = cd.trainedSkills.includes(id) || originSkillIds.has(id);
                const checked = state.skillChoices.includes(id) || isAutoTrained;
                const disabled = isAutoTrained || (!checked && full);
                return (
                  <label
                    key={id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleSkill(id, gi)}
                    />
                    <span>{sk?.name ?? id}</span>
                    {isAutoTrained && (
                      <span style={{ fontSize: 10, color: 'var(--text2)' }}>(automática)</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
