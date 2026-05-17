import { useState } from 'react';
import { useStore } from '../../store';
import tormenta20, { calcMod2 } from '../../systems/tormenta20';
import { resolveSkillId } from '../../utils/resolveSkillId';
import type { AttributeKey, Character, EquipmentItem, SpellItem } from '../../types';
import WizardProgress from './WizardProgress';
import WizardNav from './WizardNav';
import RaceStep from './steps/RaceStep';
import ClassStep from './steps/ClassStep';
import ClassPathStep from './steps/ClassPathStep';
import OriginStep from './steps/OriginStep';
import AttributesStep from './steps/AttributesStep';
import SkillsStep from './steps/SkillsStep';
import EquipmentStep from './steps/EquipmentStep';
import SpellsStep from './steps/SpellsStep';
import ReviewStep from './steps/ReviewStep';
import { initialWizardState, type WizardState } from './wizardState';

const ALL_ATTRS: AttributeKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const AUTO_KIT = ['Mochila', 'Saco de Dormir', 'Traje de Viajante'];

function getVariableCount(race: string): number {
  if (race === 'Humano') return 3;
  if (race === 'Lefou') return 3;
  if (race === 'Sereia/Tritão') return 3;
  if (race === 'Osteon') return 3;
  return 0;
}

type StepId = 'race' | 'class' | 'classPath' | 'origin' | 'attributes' | 'skills' | 'equipment' | 'spells' | 'review';

function buildSteps(state: WizardState): StepId[] {
  const steps: StepId[] = ['race', 'class'];
  if (tormenta20.classPaths[state.charClass]?.length) steps.push('classPath');
  steps.push('origin', 'attributes', 'skills', 'equipment');
  if (tormenta20.classMagicType[state.charClass] != null) steps.push('spells');
  steps.push('review');
  return steps;
}

const STEP_LABELS: Record<StepId, string> = {
  race: 'Raça', class: 'Classe', classPath: 'Caminho', origin: 'Origem',
  attributes: 'Atributos', skills: 'Perícias', equipment: 'Equipamentos',
  spells: 'Magias', review: 'Revisão',
};

function isStepValid(step: StepId, state: WizardState): boolean {
  switch (step) {
    case 'race': {
      if (!state.race) return false;
      const needed = getVariableCount(state.race);
      if (needed > 0 && Object.keys(state.raceBonusChoices).length < needed) return false;
      return true;
    }
    case 'class': return !!state.charClass;
    case 'classPath': return !!state.classPath;
    case 'origin': return !!state.origin && state.originBenefits.length === 2;
    case 'attributes': {
      if (state.attributeMethod === 'point-buy') {
        const spent = ALL_ATTRS.reduce((s, a) => {
          const v = state.attributesBase[a];
          const cost = v === -1 ? -1 : v;
          return s + cost;
        }, 0);
        return spent === 10;
      }
      return ALL_ATTRS.every((a) => state.rolledAssignments[a] !== undefined);
    }
    case 'skills': {
      const cd = tormenta20.classData[state.charClass];
      if (!cd) return true;
      return cd.skillChoices.every((group) => {
        const groupSel = state.skillChoices.filter((s) => group.options.includes(s));
        return groupSel.length >= group.count;
      });
    }
    case 'equipment': {
      const noArmor = state.charClass === 'Arcanista';
      return !!state.weaponSimple && (noArmor || !!state.armorPick);
    }
    case 'spells': {
      const max = tormenta20.classStartingSpells[state.charClass] ?? 0;
      return state.spellsPicked.length === max;
    }
    case 'review': return true;
  }
}

function buildCharacter(current: Character, state: WizardState): Partial<Character> {
  const raceInfo = tormenta20.raceData[state.race];
  const cd = tormenta20.classData[state.charClass];
  const fixedMods = raceInfo?.attributeMods ?? {};
  const varBonuses = state.raceBonusChoices ?? {};

  const attrs: Record<AttributeKey, number> = {} as Record<AttributeKey, number>;
  for (const attr of ALL_ATTRS) {
    const base = state.attributesBase[attr];
    const fixed = (fixedMods as Record<string, number>)[attr] ?? 0;
    const variable = (varBonuses as Record<string, number>)[attr] ?? 0;
    attrs[attr] = 10 + base + fixed + variable;
  }

  const conMod = calcMod2(attrs.constitution);
  const hpMax = cd ? cd.hpBase + conMod + (current.level - 1) * cd.hpPerLevel : current.vitals.hp.max;
  const manaMax = cd ? cd.mpPerLevel * current.level : current.vitals.mana.max;

  const originSkillIds = new Set(
    state.originBenefits.map(resolveSkillId).filter(Boolean) as string[]
  );
  const skills = { ...current.skills };
  for (const id of (cd?.trainedSkills ?? [])) skills[id] = true;
  for (const id of state.skillChoices) skills[id] = true;
  for (const id of originSkillIds) skills[id] = true;

  const genId = () => Math.random().toString(36).slice(2, 9);

  const equipment: EquipmentItem[] = [
    ...AUTO_KIT.map((name) => ({
      id: genId(), name, type: 'item' as const,
      bonusOrDamage: '', weight: 0, notes: '',
    })),
    ...[state.weaponSimple, state.weaponMartial].filter(Boolean).map((name) => {
      const w = tormenta20.weaponData[name!];
      return {
        id: genId(), name: name!, type: 'weapon' as const,
        bonusOrDamage: w?.damage ?? '',
        damage: w?.damage, damageType: w?.damageType, critical: w?.critical,
        weight: w?.weight ?? 0, notes: '',
      };
    }),
    ...[state.armorPick, state.shieldPick].filter(Boolean).map((name) => {
      const a = tormenta20.armorData[name!];
      return {
        id: genId(), name: name!, type: 'armor' as const,
        bonusOrDamage: a?.defenseBonus ?? '',
        weight: a?.weight ?? 0, notes: '',
      };
    }),
    ...state.shoppedItems.map(({ id, name, type, bonusOrDamage, weight, notes }) => ({
      id, name, type, bonusOrDamage, weight, notes,
    })),
  ];

  const spells: SpellItem[] = state.spellsPicked.map((name) => {
    const s = tormenta20.spellData[name];
    return {
      id: genId(),
      name,
      circleOrLevel: `${s?.circle ?? 1}º Círculo`,
      manaCost: s?.circle === 1 ? 1 : s?.circle === 2 ? 3 : 6,
      school: s?.school ?? '',
      range: s?.range ?? '',
      duration: s?.duration ?? '',
      description: s?.description ?? '',
      amplifications: s?.amplifications,
    };
  });

  const remainingMoney = state.startingMoney - state.shoppedItems.reduce((s, i) => s + i.price, 0);
  if (remainingMoney > 0 && state.startingMoney > 0) {
    equipment.push({
      id: genId(),
      name: `Bolsa (T$ ${remainingMoney})`,
      type: 'item',
      bonusOrDamage: '',
      weight: 0,
      notes: `T$ ${remainingMoney} iniciais restantes`,
    });
  }

  return {
    race: state.race,
    class: state.charClass,
    origin: state.origin,
    originBenefits: state.originBenefits,
    classPath: state.classPath || undefined,
    raceBonusChoices: Object.keys(state.raceBonusChoices).length > 0 ? state.raceBonusChoices : undefined,
    attributes: attrs,
    skills,
    equipment,
    spells,
    vitals: {
      ...current.vitals,
      hp: { current: hpMax, max: hpMax },
      mana: { current: manaMax, max: manaMax },
    },
    created: true,
  };
}

export default function CharacterCreationWizard() {
  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const char = useStore((s) => s.currentPlayerName ? s.characters[s.currentPlayerName] : null);
  const updateCharacter = useStore((s) => s.updateCharacter);
  const leaveCampaign = useStore((s) => s.leaveCampaign);
  const campaign = useStore((s) => s.campaign);

  const [wizState, setWizState] = useState<WizardState>(initialWizardState);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!currentPlayerName || !char || !campaign) return null;

  const steps = buildSteps(wizState);
  const currentStep = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const canNext = isStepValid(currentStep, wizState);

  const update = (patch: Partial<WizardState>) => setWizState((s) => ({ ...s, ...patch }));

  const handleNext = async () => {
    if (!canNext) return;
    if (isLast) {
      setSaving(true);
      const patch = buildCharacter(char, wizState);
      updateCharacter(currentPlayerName, patch);
      setSaving(false);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const handleBack = () => setStepIdx((i) => Math.max(0, i - 1));

  const stepContent: Record<StepId, React.ReactNode> = {
    race: <RaceStep state={wizState} update={update} />,
    class: <ClassStep state={wizState} update={update} />,
    classPath: <ClassPathStep state={wizState} update={update} />,
    origin: <OriginStep state={wizState} update={update} />,
    attributes: <AttributesStep state={wizState} update={update} />,
    skills: <SkillsStep state={wizState} update={update} />,
    equipment: <EquipmentStep state={wizState} update={update} />,
    spells: <SpellsStep state={wizState} update={update} />,
    review: <ReviewStep state={wizState} characterName={currentPlayerName} />,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 2 }}>
              Criação de Personagem
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>
              {currentPlayerName} · Campanha {campaign.code}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={leaveCampaign} style={{ fontSize: 11 }}>
            Sair
          </button>
        </div>

        <WizardProgress
          current={stepIdx + 1}
          total={steps.length}
          label={STEP_LABELS[currentStep]}
        />

        {/* Step card */}
        <div className="home-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, color: 'var(--gold)', marginBottom: 16, fontFamily: 'Cinzel, serif' }}>
            {STEP_LABELS[currentStep]}
          </h2>
          {stepContent[currentStep]}
          <WizardNav
            onBack={stepIdx > 0 ? handleBack : undefined}
            onNext={handleNext}
            nextDisabled={!canNext}
            isLast={isLast}
            loading={saving}
          />
        </div>

        {/* Step pills */}
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
