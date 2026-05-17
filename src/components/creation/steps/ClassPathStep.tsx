import tormenta20 from '../../../systems/tormenta20';
import type { WizardState } from '../wizardState';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

export default function ClassPathStep({ state, update }: Props) {
  const paths = tormenta20.classPaths[state.charClass] ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--text2)', fontSize: 13 }}>
        Como {state.charClass}, você deve escolher um Caminho que define seus poderes e especialização.
      </p>

      <div className="form-row">
        <label>Caminho de {state.charClass}</label>
        <select value={state.classPath} onChange={(e) => update({ classPath: e.target.value })}>
          <option value="">— Selecione —</option>
          {paths.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {state.classPath && (
        <div className="wizard-info-card">
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            Caminho <b>{state.classPath}</b> selecionado. As habilidades específicas do caminho serão detalhadas pelo Mestre.
          </p>
        </div>
      )}
    </div>
  );
}
