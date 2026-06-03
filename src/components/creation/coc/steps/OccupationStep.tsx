import { getOccupationsForEra, type CoCOccupationDef } from '../../../../systems/coc7e/occupations';
import { getSkillById, getSkillDisplayName } from '../../../../systems/coc7e/skills';
import type { CoCWizardState } from '../wizardState';

interface Props {
  state: CoCWizardState;
  update: (patch: Partial<CoCWizardState>) => void;
  era: '1920s' | 'modern';
}

const ATTR_LABEL: Record<string, string> = {
  edu: 'EDU', str: 'FOR', dex: 'DES', app: 'APA', pow: 'POD',
};

function formulaDisplay(occ: CoCOccupationDef, attrs: Record<string, number>): string {
  const pts = occ.formulaCoeffs.reduce((s, { attr, mult }) => s + (attrs[attr] ?? 0) * mult, 0);
  return `${occ.skillPointsFormula} = ${pts} pts`;
}

export default function OccupationStep({ state, update, era }: Props) {
  const occupations = getOccupationsForEra(era);
  const selected = state.occupationId;

  const ch = state.characteristics;
  const attrs = {
    edu: ch.education,
    str: ch.strength,
    dex: ch.dexterity,
    app: ch.appearance,
    pow: ch.power,
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
        Escolha a ocupação do seu investigador para a era <strong>{era === '1920s' ? 'Anos 1920' : 'Moderna'}</strong>.
        A ocupação define suas perícias de trabalho e Crédito inicial.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {occupations.map(occ => {
          const isSelected = selected === occ.id;
          const skillPts = formulaDisplay(occ, attrs);
          return (
            <button
              key={occ.id}
              onClick={() => update({ occupationId: occ.id, skillValues: {} })}
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(201,168,76,.08)' : 'var(--bg-card2)',
                cursor: 'pointer',
                transition: 'border-color .15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: isSelected ? 'var(--gold)' : 'var(--text)',
                }}>
                  {occ.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  Crédito {occ.creditRating[0]}–{occ.creditRating[1]}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                {skillPts}
              </div>

              {isSelected && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Perícias de Ocupação
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {occ.occupationSkills.map(sid => {
                      const skillDef = getSkillById(sid);
                      return (
                        <span key={sid} style={{
                          padding: '2px 7px', borderRadius: 4, fontSize: 11,
                          background: 'rgba(201,168,76,.12)', color: 'var(--gold)',
                          border: '1px solid rgba(201,168,76,.25)',
                        }}>
                          {skillDef ? getSkillDisplayName(skillDef) : sid}
                        </span>
                      );
                    })}
                    {occ.freeSlots > 0 && (
                      <span style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: 11,
                        background: 'rgba(100,100,255,.1)', color: 'var(--text2)',
                        border: '1px solid rgba(100,100,255,.2)',
                      }}>
                        +{occ.freeSlots} livre{occ.freeSlots > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
