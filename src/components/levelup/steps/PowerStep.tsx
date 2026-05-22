import tormenta20 from '../../../systems/tormenta20';
import type { Character, GeneralPower, PowerGroup } from '../../../types';
import type { LevelUpState } from '../levelUpState';

interface Props {
  char: Character;
  newLevel: number;
  state: LevelUpState;
  update: (patch: Partial<LevelUpState>) => void;
}

const GROUPS: PowerGroup[] = ['Combate', 'Destino', 'Magia', 'Concedidos', 'Tormenta'];

function meetsPrereqs(power: GeneralPower, char: Character, newLevel: number): boolean {
  const p = power.prereqs;
  if (!p) return true;

  if (p.minLevel && newLevel < p.minLevel) return false;

  if (p.attributes) {
    for (const [attr, minVal] of Object.entries(p.attributes) as [string, number][]) {
      const charVal = (char.attributes as unknown as Record<string, number>)[attr] ?? 0;
      if (charVal < minVal) return false;
    }
  }

  if (p.skillsTrained && p.skillsTrained.length > 0) {
    const hasSome = p.skillsTrained.some((id) => char.skills[id]);
    if (!hasSome) return false;
  }

  if (p.powers && p.powers.length > 0) {
    const charPowerNames = new Set((char.powers ?? []).map((pw) => pw.name));
    const hasAll = p.powers.every((name) => charPowerNames.has(name));
    if (!hasAll) return false;
  }

  return true;
}

export default function PowerStep({ char, newLevel, state, update }: Props) {
  const allPowers = tormenta20.generalPowers;
  const charPowerNames = new Set((char.powers ?? []).map((pw) => pw.name));

  const search = state.powerSearch.toLowerCase();
  const groupFilter = state.powerGroupFilter as PowerGroup | '';

  const eligible = allPowers.filter((p) => {
    if (charPowerNames.has(p.name)) return false;
    if (!meetsPrereqs(p, char, newLevel)) return false;
    if (groupFilter && p.group !== groupFilter) return false;
    if (search && !p.name.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        Escolha um Poder Geral. Apenas poderes cujos pré-requisitos você já cumpre são exibidos.
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={state.powerSearch}
          onChange={(e) => update({ powerSearch: e.target.value })}
          style={{ flex: 1, minWidth: 140, fontSize: 12, padding: '4px 8px' }}
        />
        <select
          value={state.powerGroupFilter}
          onChange={(e) => update({ powerGroupFilter: e.target.value })}
          style={{ fontSize: 12, padding: '4px 6px' }}
        >
          <option value="">Todos os grupos</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {state.chosenPower && (
        <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.4)', borderRadius: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--gold)' }}>✓ Selecionado: </span>
          <strong style={{ fontSize: 13 }}>{state.chosenPower}</strong>
          <button
            className="btn btn-secondary btn-xs"
            style={{ marginLeft: 8 }}
            onClick={() => update({ chosenPower: null })}
          >
            Trocar
          </button>
        </div>
      )}

      <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {eligible.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', textAlign: 'center', padding: 16 }}>
            Nenhum poder disponível com os filtros atuais.
          </p>
        )}
        {eligible.map((power) => {
          const selected = state.chosenPower === power.name;
          return (
            <button
              key={power.name}
              className={`lu-power-card${selected ? ' lu-power-card--selected' : ''}`}
              onClick={() => update({ chosenPower: selected ? null : power.name })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <strong style={{ fontSize: 13, color: selected ? 'var(--gold)' : 'var(--text)', textAlign: 'left' }}>
                  {power.name}
                </strong>
                <span style={{ fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {power.group}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, textAlign: 'left', lineHeight: 1.45 }}>
                {power.description}
              </p>
              {power.prereqs?.other && power.prereqs.other.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'left', fontStyle: 'italic' }}>
                  Nota: {power.prereqs.other.join(', ')}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
