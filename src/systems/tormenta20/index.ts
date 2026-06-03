import type { GameSystem, Character, Campaign } from '../../types';
import { classList, originData, originList, deityList } from './origins';
import { raceList, raceData } from './races';
import { classData, classMagicType, classStartingSpells, classPaths, classProficiencies, classProgression, casterProgression } from './classes';
import { vitalFields, skillList, shortRestFormula, longRestFormula } from './skills';
import { generalPowers } from './powers';
import { weaponData, armorData, generalItemData } from './equipment';
import { spellData } from './spells';

const calcMod = (val: number) => Math.floor((val - 10) / 2);

const tormenta20: GameSystem = {
  systemId: 'tormenta20',
  name: 'Tormenta 20',
  classList, originData, originList, deityList,
  raceList, raceData,
  classData,
  vitalFields, skillList, shortRestFormula, longRestFormula,
  classMagicType, classStartingSpells, classPaths, classProficiencies,
  variableBonusRaces: ['Humano', 'Lefou', 'Moreau', 'Sereia/Tritão', 'Osteon'],
  classProgression, casterProgression,
  generalPowers,
  weaponData, armorData, generalItemData,
  spellData,
};

export default tormenta20;
export const calcMod2 = calcMod;
export const skillTotal = (attrValue: number, trained: boolean, level: number): number => {
  const mod = calcMod(attrValue);
  const trainingBonus = trained ? 4 + Math.floor(level / 2) : 0;
  return mod + trainingBonus;
};
