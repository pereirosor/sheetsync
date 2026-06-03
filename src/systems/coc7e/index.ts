import type { GameSystem, OccupationInfo } from '../../types';
import { COC_SKILLS } from './skills';
import { COC_OCCUPATIONS } from './occupations';

const occupationList: string[] = COC_OCCUPATIONS.map(o => o.id);

const occupationData: Record<string, OccupationInfo> = Object.fromEntries(
  COC_OCCUPATIONS.map(o => [
    o.id,
    {
      skillPointsFormula: o.skillPointsFormula,
      creditRating: o.creditRating,
      occupationSkills: o.occupationSkills,
      personalSkillChoices: 4, // INT×2 points — same for all occupations
      era: o.era,
    } satisfies OccupationInfo,
  ]),
);

const skillBaseValues: Record<string, number> = Object.fromEntries(
  COC_SKILLS.filter(s => !s.isDynamic).map(s => [s.id, s.baseValue]),
);

const coc7e: GameSystem = {
  systemId: 'coc7e',
  name: 'Call of Cthulhu 7ª Ed.',

  // CoC não usa classes, raças, origens ou poderes no estilo T20
  classList: [],
  originList: [],
  originData: {},
  deityList: [],
  raceList: [],
  raceData: {},
  classData: {},
  classMagicType: {},
  classStartingSpells: {},
  classPaths: {},
  classProficiencies: {},
  variableBonusRaces: [],
  classProgression: {},
  casterProgression: {},
  generalPowers: [],
  weaponData: {},
  armorData: {},
  generalItemData: {},
  spellData: {},

  // Perícias CoC (não usa attribute-based SkillDef do T20)
  skillList: [],
  skillBaseValues,

  // Ocupações CoC
  occupationList,
  occupationData,

  // Vitais CoC: PV e Sanidade (sem Mana)
  vitalFields: [
    { key: 'hp',     label: 'Pontos de Vida', optional: false, color: 'var(--hp)' },
    { key: 'sanity', label: 'Sanidade',        optional: false, color: 'var(--sanity)' },
  ],

  // First Aid: +1 HP, uma vez até próximo ferimento grave
  shortRestFormula: (_char, _campaign) => ({ hp: 1 }),

  // Cura natural: 1d3 HP/semana
  longRestFormula: (_char, _campaign) => ({
    hp: Math.floor(Math.random() * 3) + 1,
  }),
};

export default coc7e;
