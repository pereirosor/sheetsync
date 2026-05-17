import tormenta20 from '../../../systems/tormenta20';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function ClassStep({ state, update }: Props) {
  const cd = state.charClass ? tormenta20.classData[state.charClass] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-row">
        <label>Classe</label>
        <select
          value={state.charClass}
          onChange={(e) => update({ charClass: e.target.value, classPath: '', skillChoices: [], spellsPicked: [] })}
        >
          <option value="">— Selecione —</option>
          {tormenta20.classList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {cd && (
        <>
          <div className="wizard-info-card">
            <p style={{ fontWeight: 600, marginBottom: 6 }}>{state.charClass}</p>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 2 }}>
              <b>PV base:</b> {cd.hpBase} + Con &nbsp;|&nbsp; <b>+PV/nível:</b> {cd.hpPerLevel} &nbsp;|&nbsp; <b>PM/nível:</b> {cd.mpPerLevel}
            </p>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 2 }}>
              <b>Proficiências:</b> {cd.proficiencies || 'Nenhuma'}
            </p>
            <p style={{ color: 'var(--text2)', fontSize: 13 }}>
              <b>Habilidades de 1º nível:</b> {cd.level1Abilities.join(', ')}
            </p>
          </div>

          {cd.trainedSkills.length > 0 && (
            <div className="wizard-info-card">
              <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Perícias treinadas automaticamente:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cd.trainedSkills.map((id) => {
                  const sk = tormenta20.skillList.find((s) => s.id === id);
                  return (
                    <span key={id} className="wizard-tag">{sk?.name ?? id}</span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
