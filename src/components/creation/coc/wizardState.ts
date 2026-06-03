import type { CoCCharacteristics } from '../../../systems/coc7e/characteristics';

export type CoCCharGenMethod = 'roll' | 'pointbuy' | 'quickstart';

export interface CoCWizardState {
  charGenMethod: CoCCharGenMethod;
  characteristics: CoCCharacteristics;
  // lock individual characteristics after rolling (so player can re-roll specific ones)
  lockedChars: Partial<Record<keyof CoCCharacteristics, boolean>>;

  occupationId: string;

  // skill ID → current target value (base + spent points)
  skillValues: Record<string, number>;

  name: string;
  age: number;
  background: {
    ideology: string;
    importantPerson: string;
    meaningfulLocation: string;
    treasuredPossession: string;
    trait: string;
    injuriesScars: string;
    phobiasManias: string;
    tomesSpells: string;
    encounters: string;
    fellowInvestigator: string;
  };
}

export const initialCoCWizardState: CoCWizardState = {
  charGenMethod: 'roll',
  characteristics: {
    strength: 0,
    constitution: 0,
    size: 0,
    dexterity: 0,
    appearance: 0,
    intelligence: 0,
    power: 0,
    education: 0,
  },
  lockedChars: {},
  occupationId: '',
  skillValues: {},
  name: '',
  age: 25,
  background: {
    ideology: '',
    importantPerson: '',
    meaningfulLocation: '',
    treasuredPossession: '',
    trait: '',
    injuriesScars: '',
    phobiasManias: '',
    tomesSpells: '',
    encounters: '',
    fellowInvestigator: '',
  },
};
