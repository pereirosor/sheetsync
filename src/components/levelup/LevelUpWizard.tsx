import { useState } from 'react';
import { useStore } from '../../store';
import tormenta20, { calcMod2 } from '../../systems/tormenta20';
import type { Character, SpellItem } from '../../types';
import WizardProgress from '../creation/WizardProgress';
import WizardNav from '../creation/WizardNav';
import VitalsStep from './steps/VitalsStep';
import FixedFeaturesStep from './steps/FixedFeaturesStep';
import PowerStep from './steps/PowerStep';
import LearnSpellsStep from './steps/LearnSpellsStep';
import { initialLevelUpState, type LevelUpState } from './levelUpState';

type StepId = 'vitals' | 'features' | 'power' | 'spells';

const genId = () => Math.random().toString(36).slice(2, 9);

function getSpellsToLearn(charClass: string, newLevel: number): number {
  const cp = tormenta20.casterProgression[charClass];
  if (!cp) return 0;
  if (cp.evenLevelsOnly) return newLevel % 2 === 0 ? 1 : 0;
  return cp.spellsPerLevel;
}

function hasPowerChoiceAtLevel(charClass: string, newLevel: number): boolean {
  const progression = tormenta20.classProgression[charClass];
  if (!progression || newLevel < 1 || newLevel > 20) return false;
  const features = progression[newLevel - 1] ?? [];
  return features.some((f) => /poder de/i.test(f));
}

function buildSteps(char: Character, newLevel: number): StepId[] {
  const steps: StepId[] = ['vitals', 'features'];
  if (hasPowerChoiceAtLevel(char.class, newLevel)) steps.push('power');
  const spellsNeeded = getSpellsToLearn(char.class, newLevel);
  if (spellsNeeded > 0) steps.push('spells');
  return steps;
}

const STEP_LABELS: Record<StepId, string> = {
  vitals: 'PV & PM',
  features: 'Habilidades',
  power: 'Poder',
  spells: 'Magias',
};

function isStepValid(step: StepId, state: LevelUpState, char: Character, newLevel: number): boolean {
  switch (step) {
    case 'vitals': return true;
    case 'features': return true;
    case 'power': return !!state.chosenPower;
    case 'spells': {
      const needed = getSpellsToLearn(char.class, newLevel);
      return state.chosenSpells.length === needed;
    }
  }
}

interface Props {
  characterName: string;
  onClose: () => void;
}

export default function LevelUpWizard({ characterName, onClose }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const campaign = useStore((s) => s.campaign);
  const applyLevelUp = useStore((s) => s.applyLevelUp);
  const addToast = useStore((s) => s.addToast);

  const [luState, setLuState] = useState<LevelUpState>(initialLevelUpState);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!char || !campaign) return null;

  const newLevel = char.level + 1;
  const steps = buildSteps(char, newLevel);
  const currentStep = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const canNext = isStepValid(currentStep, luState, char, newLevel);

  const update = (patch: Partial<LevelUpState>) => setLuState((s) => ({ ...s, ...patch }));

  const handleFinish = async () => {
    setSaving(true);
    const cd = tormenta20.classData[char.class];
    if (!cd) { setSaving(false); return; }

    const conMod = calcMod2(char.attributes.constitution);
    const hpGain = Math.max(1, cd.hpPerLevel + conMod);
    const newHpMax = char.vitals.hp.max + hpGain;
    const newManaMax = cd.mpPerLevel * newLevel;

    const newPowers = luState.chosenPower
      ? [...(char.powers ?? []), { name: luState.chosenPower, level: newLevel }]
      : (char.powers ?? []);

    const newSpells: SpellItem[] = luState.chosenSpells.map((name) => {
      const s = tormenta20.spellData[name];
      return {
        id: genId(),
        name,
        circleOrLevel: `${s?.circle ?? 1}º Círculo`,
        manaCost: (s?.circle ?? 1) === 1 ? 1 : (s?.circle ?? 1) === 2 ? 3 : 6,
        school: s?.school ?? '',
        range: s?.range ?? '',
        duration: s?.duration ?? '',
        description: s?.description ?? '',
        amplifications: s?.amplifications,
      };
    });

    const patch: Partial<Character> = {
      level: newLevel,
      vitals: {
        ...char.vitals,
        hp: { current: char.vitals.hp.current + hpGain, max: newHpMax },
        mana: newManaMax > 0 ? { current: char.vitals.mana.current + cd.mpPerLevel, max: newManaMax } : char.vitals.mana,
      },
      powers: newPowers,
      spells: [...char.spells, ...newSpells],
    };

    applyLevelUp(characterName, patch);
    addToast(`${char.name} subiu para o nível ${newLevel}!`, 'success');
    setSaving(false);
    onClose();
  };

  const handleNext = async () => {
    if (!canNext) return;
    if (isLast) {
      await handleFinish();
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const stepContent: Record<StepId, React.ReactNode> = {
    vitals: <VitalsStep char={char} newLevel={newLevel} />,
    features: <FixedFeaturesStep char={char} newLevel={newLevel} />,
    power: <PowerStep char={char} newLevel={newLevel} state={luState} update={update} />,
    spells: (
      <LearnSpellsStep
        char={char}
        newLevel={newLevel}
        state={luState}
        update={update}
        spellsToLearn={getSpellsToLearn(char.class, newLevel)}
      />
    ),
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 2 }}>
              Subir de Nível
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>
              {char.name} · {char.class} → Nível {newLevel}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ fontSize: 11 }}>
            Cancelar
          </button>
        </div>

        <WizardProgress
          current={stepIdx + 1}
          total={steps.length}
          label={STEP_LABELS[currentStep]}
        />

        <div className="home-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, color: 'var(--gold)', marginBottom: 16, fontFamily: 'Cinzel, serif' }}>
            {STEP_LABELS[currentStep]}
          </h2>
          {stepContent[currentStep]}
          <WizardNav
            onBack={stepIdx > 0 ? () => setStepIdx((i) => i - 1) : undefined}
            onNext={handleNext}
            nextDisabled={!canNext}
            isLast={isLast}
            loading={saving}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16, flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <span
              key={s}
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
