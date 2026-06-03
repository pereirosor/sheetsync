import { useState } from 'react';
import { useStore } from '../../../store';
import {
  calcHP, calcMP, calcSAN, calcMOV,
} from '../../../systems/coc7e/characteristics';
import { getOccupationById } from '../../../systems/coc7e/occupations';
import { COC_SKILLS, calcSkillBase } from '../../../systems/coc7e/skills';
import WizardProgress from '../WizardProgress';
import WizardNav from '../WizardNav';
import CharacteristicsStep from './steps/CharacteristicsStep';
import OccupationStep from './steps/OccupationStep';
import SkillsStep from './steps/SkillsStep';
import BackgroundStep from './steps/BackgroundStep';
import ReviewStep from './steps/ReviewStep';
import { initialCoCWizardState, type CoCWizardState } from './wizardState';
import type { Character } from '../../../types';

type StepId = 'characteristics' | 'occupation' | 'skills' | 'background' | 'review';

const STEPS: StepId[] = ['characteristics', 'occupation', 'skills', 'background', 'review'];

const STEP_LABELS: Record<StepId, string> = {
  characteristics: 'Características',
  occupation: 'Ocupação',
  skills: 'Perícias',
  background: 'Background',
  review: 'Revisão',
};

function isStepValid(step: StepId, state: CoCWizardState): boolean {
  const ch = state.characteristics;
  const allFilled = Object.values(ch).every(v => v > 0);
  switch (step) {
    case 'characteristics': return allFilled;
    case 'occupation': return !!state.occupationId;
    case 'skills': return true; // optional to spend all points
    case 'background': return !!state.name.trim();
    case 'review': return true;
  }
}

function getMissingMessage(step: StepId, state: CoCWizardState): string | null {
  const ch = state.characteristics;
  switch (step) {
    case 'characteristics':
      if (Object.values(ch).some(v => v === 0)) return 'Defina todas as 8 características.';
      return null;
    case 'occupation':
      return 'Selecione uma ocupação.';
    case 'background':
      return 'Informe o nome do investigador.';
    default:
      return null;
  }
}

function buildCharacter(
  state: CoCWizardState,
  current: Character,
  era: '1920s' | 'modern',
): Partial<Character> {
  const ch = state.characteristics;
  const occ = getOccupationById(state.occupationId);
  const dex = ch.dexterity, edu = ch.education;

  const hpMax  = calcHP(ch.constitution, ch.size);
  const mpMax  = calcMP(ch.power);
  const sanMax = calcSAN(ch.power);
  const mov    = calcMOV(ch.strength, ch.dexterity, ch.size, state.age);

  // Build cocSkills: all skills with their final values
  const cocSkills: Record<string, number> = {};
  for (const skill of COC_SKILLS) {
    if (skill.era && !skill.era.includes('any') && !skill.era.includes(era)) continue;
    const base = calcSkillBase(skill, dex, edu);
    const val  = state.skillValues[skill.id] ?? base;
    cocSkills[skill.id] = val;
  }

  // Credit rating from occupation
  const creditBase = occ ? occ.creditRating[0] : 0;
  cocSkills['credito'] = state.skillValues['credito'] ?? creditBase;

  return {
    name: state.name.trim() || current.name,
    class: occ?.name ?? 'Investigador',
    race: 'Humano',
    origin: '',
    level: 1,
    speed: mov,
    attributes: {
      strength:     ch.strength,
      dexterity:    ch.dexterity,
      constitution: ch.constitution,
      intelligence: ch.intelligence,
      wisdom:       0,
      charisma:     0,
      size:         ch.size,
      power:        ch.power,
      appearance:   ch.appearance,
      education:    ch.education,
    },
    vitals: {
      hp:     { current: hpMax, max: hpMax },
      mana:   { current: mpMax, max: mpMax },
      sanity: { current: sanMax, max: sanMax },
      ac: 0,
    },
    skills: {},
    cocSkills,
    cocOccupation: state.occupationId,
    notes: buildBackgroundNotes(state),
    created: true,
  };
}

function buildBackgroundNotes(state: CoCWizardState): string {
  const bg = state.background;
  const parts: string[] = [];
  if (bg.ideology)           parts.push(`Ideologia: ${bg.ideology}`);
  if (bg.importantPerson)    parts.push(`Pessoa importante: ${bg.importantPerson}`);
  if (bg.meaningfulLocation) parts.push(`Lugar significativo: ${bg.meaningfulLocation}`);
  if (bg.treasuredPossession) parts.push(`Pertence precioso: ${bg.treasuredPossession}`);
  if (bg.trait)              parts.push(`Traço: ${bg.trait}`);
  if (bg.injuriesScars)      parts.push(`Ferimentos/Cicatrizes: ${bg.injuriesScars}`);
  if (bg.phobiasManias)      parts.push(`Fobias/Manias: ${bg.phobiasManias}`);
  if (bg.tomesSpells)        parts.push(`Tomos/Magias: ${bg.tomesSpells}`);
  if (bg.encounters)         parts.push(`Encontros arcanos: ${bg.encounters}`);
  if (bg.fellowInvestigator) parts.push(`Colega: ${bg.fellowInvestigator}`);
  return parts.join('\n');
}

export default function CoCCreationWizard() {
  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const campaign          = useStore((s) => s.campaign);
  const char              = useStore((s) => s.currentPlayerName ? s.characters[s.currentPlayerName] : null);
  const updateCharacter   = useStore((s) => s.updateCharacter);
  const leaveCampaign     = useStore((s) => s.leaveCampaign);
  const addToast          = useStore((s) => s.addToast);

  const [wizState, setWizState]  = useState<CoCWizardState>(initialCoCWizardState);
  const [stepIdx, setStepIdx]    = useState(0);
  const [saving, setSaving]      = useState(false);

  if (!currentPlayerName || !char || !campaign) return null;

  const era    = campaign.settings.cocEra ?? '1920s';
  const eraLabel = era === 'modern' ? 'Era Moderna' : 'Anos 1920';

  const currentStep = STEPS[stepIdx];
  const isLast      = stepIdx === STEPS.length - 1;
  const canNext     = isStepValid(currentStep, wizState);

  const update = (patch: Partial<CoCWizardState>) =>
    setWizState(s => ({ ...s, ...patch }));

  const handleNext = async () => {
    if (!canNext) {
      const msg = getMissingMessage(currentStep, wizState);
      if (msg) addToast(msg, 'warning');
      return;
    }
    if (isLast) {
      setSaving(true);
      const patch = buildCharacter(wizState, char, era);
      updateCharacter(currentPlayerName, patch);
      setSaving(false);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const stepContent: Record<StepId, React.ReactNode> = {
    characteristics: <CharacteristicsStep state={wizState} update={update} />,
    occupation:      <OccupationStep      state={wizState} update={update} era={era} />,
    skills:          <SkillsStep          state={wizState} update={update} era={era} />,
    background:      <BackgroundStep      state={wizState} update={update} />,
    review:          <ReviewStep          state={wizState} />,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 2 }}>
              Criação de Investigador
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>
              {currentPlayerName} · Campanha {campaign.code} · {eraLabel}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={leaveCampaign} style={{ fontSize: 11 }}>
            Sair
          </button>
        </div>

        <WizardProgress current={stepIdx + 1} total={STEPS.length} label={STEP_LABELS[currentStep]} />

        <div className="home-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, color: 'var(--gold)', marginBottom: 16, fontFamily: 'Cinzel, serif' }}>
            {STEP_LABELS[currentStep]}
          </h2>
          {stepContent[currentStep]}
          <WizardNav
            onBack={stepIdx > 0 ? () => setStepIdx(i => i - 1) : undefined}
            onNext={handleNext}
            nextDisabled={!canNext}
            isLast={isLast}
            loading={saving}
          />
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === stepIdx ? 'var(--gold)' : i < stepIdx ? 'var(--text2)' : 'var(--bg-card2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
