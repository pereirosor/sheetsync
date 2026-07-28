import tormenta20 from '../../../systems/tormenta20';
import type { AttributeKey } from '../../../types';
import type { WizardState } from '../wizardState';

const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'Força', dexterity: 'Destreza', constitution: 'Constituição',
  intelligence: 'Inteligência', wisdom: 'Sabedoria', charisma: 'Carisma',
  size: 'Tamanho', power: 'Poder', appearance: 'Aparência', education: 'Educação',
};
const ALL_ATTRS: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}

function getVariableConfig(race: string): { count: number; exclude: AttributeKey[] } | null {
  if (race === 'Humano') return { count: 3, exclude: [] };
  if (race === 'Lefou') return { count: 3, exclude: ['charisma'] };
  if (race === 'Sereia/Tritão') return { count: 3, exclude: [] };
  if (race === 'Osteon') return { count: 3, exclude: ['constitution'] };
  return null;
}

export default function RaceStep({ state, update }: Props) {
  const raceInfo = state.race ? tormenta20.raceData[state.race] : null;
  const varConfig = state.race ? getVariableConfig(state.race) : null;

  const handleRaceChange = (race: string) => {
    // versatileSkills só existe para Humano; trocar de raça precisa limpá-las,
    // senão perícias de uma raça anterior continuariam sendo salvas.
    update({ race, raceBonusChoices: {}, versatileSkills: [] });
  };

  const toggleBonus = (attr: AttributeKey) => {
    const cfg = varConfig;
    if (!cfg) return;
    const current = { ...state.raceBonusChoices };
    if (current[attr]) {
      delete current[attr];
    } else {
      const chosen = Object.keys(current).length;
      if (chosen >= cfg.count) return;
      current[attr] = 2;
    }
    update({ raceBonusChoices: current });
  };

  const chosenCount = Object.keys(state.raceBonusChoices).length;
  const varNeeded = varConfig ? chosenCount < varConfig.count : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-row">
        <label>Raça</label>
        <select value={state.race} onChange={(e) => handleRaceChange(e.target.value)}>
          <option value="">— Selecione —</option>
          {tormenta20.raceList.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {raceInfo && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{state.race}</p>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 4 }}>
            <b>Bônus de Atributo:</b> {raceInfo.attributeBonuses}
          </p>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            <b>Habilidades:</b> {raceInfo.abilities.join(' · ')}
          </p>
        </div>
      )}

      {varConfig && state.race && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Escolha {varConfig.count} atributos para receber +2
            <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
              ({chosenCount}/{varConfig.count} escolhidos)
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ALL_ATTRS.filter((a) => !varConfig.exclude.includes(a)).map((attr) => {
              const chosen = !!state.raceBonusChoices[attr];
              const disabled = !chosen && chosenCount >= varConfig.count;
              return (
                <label
                  key={attr}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={chosen}
                    disabled={disabled}
                    onChange={() => toggleBonus(attr)}
                  />
                  {ATTR_LABELS[attr]}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {state.race && varNeeded && (
        <p style={{ color: 'var(--gold)', fontSize: 12 }}>
          Escolha ainda {varConfig!.count - chosenCount} atributo(s) para continuar.
        </p>
      )}
    </div>
  );
}
