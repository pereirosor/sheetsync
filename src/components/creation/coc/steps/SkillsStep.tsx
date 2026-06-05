import { useMemo, useState } from 'react';
import {
  COC_SKILLS,
  calcSkillBase,
  getSkillDisplayName,
  getSkillsForEra,
  type CoCSkillDef,
} from '../../../../systems/coc7e/skills';
import { getOccupationById, calcOccupationSkillPoints } from '../../../../systems/coc7e/occupations';
import type { CoCWizardState } from '../wizardState';

interface Props {
  state: CoCWizardState;
  update: (patch: Partial<CoCWizardState>) => void;
  era: '1920s' | 'modern';
}

const SKILL_MAX = 80; // max value during creation

export default function SkillsStep({ state, update, era }: Props) {
  const ch = state.characteristics;
  const occ = getOccupationById(state.occupationId);

  const dex = ch.dexterity;
  const edu = ch.education;

  const occAttrs = {
    edu: ch.education, str: ch.strength, dex: ch.dexterity,
    app: ch.appearance, pow: ch.power,
  };

  const totalOccPts = occ ? calcOccupationSkillPoints(occ, occAttrs) : 0;
  const totalPersonalPts = ch.intelligence * 2;

  const occSkillIds = new Set(occ?.occupationSkills ?? []);
  const allSkills = getSkillsForEra(era);

  const skillBase = (skill: CoCSkillDef) => calcSkillBase(skill, dex, edu);

  const currentValues = state.skillValues;

  const occPointsSpent = useMemo(() => {
    let spent = 0;
    for (const sid of occSkillIds) {
      const skill = COC_SKILLS.find(s => s.id === sid);
      if (!skill) continue;
      const base = skillBase(skill);
      const val = currentValues[sid] ?? base;
      spent += Math.max(0, val - base);
    }
    return spent;
  }, [currentValues, occSkillIds, dex, edu]);

  const personalPointsSpent = useMemo(() => {
    let spent = 0;
    for (const [sid, val] of Object.entries(currentValues)) {
      if (occSkillIds.has(sid)) continue;
      const skill = COC_SKILLS.find(s => s.id === sid);
      if (!skill) continue;
      const base = skillBase(skill);
      spent += Math.max(0, val - base);
    }
    return spent;
  }, [currentValues, occSkillIds, dex, edu]);

  const occRemaining = totalOccPts - occPointsSpent;
  const personalRemaining = totalPersonalPts - personalPointsSpent;

  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});

  const handleChange = (skill: CoCSkillDef, delta: number, isOcc: boolean) => {
    const base = skillBase(skill);
    const cur = currentValues[skill.id] ?? base;
    const next = cur + delta;
    if (next < base || next > SKILL_MAX) return;
    if (delta > 0) {
      if (isOcc && occRemaining < delta) return;
      if (!isOcc && personalRemaining < delta) return;
    }
    update({ skillValues: { ...currentValues, [skill.id]: next } });
  };

  const handleSet = (skill: CoCSkillDef, target: number, isOcc: boolean) => {
    const base = skillBase(skill);
    const cur = currentValues[skill.id] ?? base;
    const remaining = isOcc ? occRemaining : personalRemaining;
    const maxAllowed = Math.min(SKILL_MAX, cur + remaining);
    const next = Math.max(base, Math.min(maxAllowed, isNaN(target) ? base : target));
    update({ skillValues: { ...currentValues, [skill.id]: next } });
  };

  const renderSkillRow = (skill: CoCSkillDef, isOcc: boolean) => {
    const base = skillBase(skill);
    const val = currentValues[skill.id] ?? base;
    const spent = Math.max(0, val - base);
    return (
      <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
        <span style={{
          flex: 1, fontSize: 12,
          color: isOcc ? 'var(--text)' : 'var(--text2)',
          fontWeight: isOcc ? 600 : 400,
        }}>
          {getSkillDisplayName(skill)}
          <span style={{ fontSize: 10, color: 'var(--text2)', marginLeft: 4 }}>({base}%)</span>
        </span>
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: '1px 7px', fontSize: 13 }}
          onClick={() => handleChange(skill, -1, isOcc)}
          disabled={val <= base}
        >−</button>
        <input
          type="number"
          value={skillInputs[skill.id] ?? val}
          onChange={e => setSkillInputs(prev => ({ ...prev, [skill.id]: e.target.value }))}
          onBlur={e => {
            handleSet(skill, Math.round(Number(e.target.value)), isOcc);
            setSkillInputs(prev => { const n = { ...prev }; delete n[skill.id]; return n; });
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSet(skill, Math.round(Number(skillInputs[skill.id] ?? val)), isOcc);
              setSkillInputs(prev => { const n = { ...prev }; delete n[skill.id]; return n; });
            }
          }}
          style={{
            width: 48, textAlign: 'center', fontWeight: 700, fontSize: 13,
            color: spent > 0 ? 'var(--gold)' : 'var(--text)',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 4px',
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>%</span>
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: '1px 7px', fontSize: 13 }}
          onClick={() => handleChange(skill, 1, isOcc)}
          disabled={val >= SKILL_MAX || (isOcc ? occRemaining < 1 : personalRemaining < 1)}
        >+</button>
      </div>
    );
  };

  const occSkills = allSkills.filter(s => occSkillIds.has(s.id));
  const personalSkills = allSkills.filter(s => !occSkillIds.has(s.id) && !s.isDynamic);

  return (
    <div>
      {/* Point pools */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div style={{
          padding: '10px 12px', borderRadius: 6, textAlign: 'center',
          background: occRemaining === 0 ? 'rgba(76,175,80,.1)' : 'var(--bg-card2)',
          border: `1px solid ${occRemaining === 0 ? 'var(--success)' : 'var(--border)'}`,
        }}>
          <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 2 }}>Ocupação</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: occRemaining === 0 ? 'var(--success)' : 'var(--gold)' }}>
            {occRemaining}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>de {totalOccPts} pts</div>
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 6, textAlign: 'center',
          background: personalRemaining === 0 ? 'rgba(76,175,80,.1)' : 'var(--bg-card2)',
          border: `1px solid ${personalRemaining === 0 ? 'var(--success)' : 'var(--border)'}`,
        }}>
          <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 2 }}>Interesse Pessoal</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: personalRemaining === 0 ? 'var(--success)' : 'var(--gold)' }}>
            {personalRemaining}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>de {totalPersonalPts} pts</div>
        </div>
      </div>

      {/* Occupation skills */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Perícias de Ocupação
        </div>
        {occSkills.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Nenhuma perícia de ocupação definida.</p>
        ) : (
          occSkills.map(s => renderSkillRow(s, true))
        )}
      </div>

      {/* Personal interest skills */}
      {personalRemaining < totalPersonalPts || Object.keys(currentValues).some(id => !occSkillIds.has(id)) ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interesse Pessoal
          </div>
          {personalSkills.map(s => renderSkillRow(s, false))}
        </div>
      ) : (
        personalRemaining > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interesse Pessoal — qualquer perícia
            </div>
            {personalSkills.map(s => renderSkillRow(s, false))}
          </div>
        )
      )}
    </div>
  );
}
