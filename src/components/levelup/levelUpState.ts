export interface LevelUpState {
  chosenPower: string | null;
  chosenSpells: string[];
  powerSearch: string;
  powerGroupFilter: string;
  grantedSkills: string[];
}

export const initialLevelUpState: LevelUpState = {
  chosenPower: null,
  chosenSpells: [],
  powerSearch: '',
  powerGroupFilter: '',
  grantedSkills: [],
};
