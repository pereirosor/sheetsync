import tormenta20 from '../../../systems/tormenta20';
import { resolveSkillId } from '../../../utils/resolveSkillId';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function OriginStep({ state, update }: Props) {
  const benefits = state.origin ? tormenta20.originData[state.origin] ?? [] : [];
  const selected = state.originBenefits;

  const handleOriginChange = (origin: string) => {
    update({ origin, originBenefits: [] });
  };

  const toggleBenefit = (b: string) => {
    if (selected.includes(b)) {
      update({ originBenefits: selected.filter((x) => x !== b) });
    } else if (selected.length < 2) {
      update({ originBenefits: [...selected, b] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-row">
        <label>Origem</label>
        <select value={state.origin} onChange={(e) => handleOriginChange(e.target.value)}>
          <option value="">— Selecione —</option>
          {tormenta20.originList.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {benefits.length > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
            Benefícios de Origem — escolha 2
            <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: 8 }}>
              ({selected.length}/2)
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {benefits.map((b) => {
              const checked = selected.includes(b);
              const disabled = !checked && selected.length >= 2;
              const isSkill = !!resolveSkillId(b);
              return (
                <label
                  key={b}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleBenefit(b)}
                  />
                  <span>
                    {b}
                    {isSkill && (
                      <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 4 }}>(perícia)</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
