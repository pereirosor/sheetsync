import type { AttributeKey, EquipmentItem } from '../../types';

export interface WizardState {
  race: string;
  raceBonusChoices: Partial<Record<AttributeKey, number>>;
  charClass: string;
  classPath: string;
  origin: string;
  originBenefits: string[];
  attributeMethod: 'point-buy' | 'roll';
  attributesBase: Record<AttributeKey, number>;
  rolledPool: number[];
  rolledAssignments: Partial<Record<AttributeKey, number>>;
  rollAttempts: number;
  skillChoices: string[];
  startingMoney: number;
  weaponSimple: string;
  weaponMartial: string;
  armorPick: string;
  shieldPick: string;
  shoppedItems: (EquipmentItem & { price: number })[];
  spellsPicked: string[];
}

export const initialWizardState: WizardState = {
  race: '',
  raceBonusChoices: {},
  charClass: '',
  classPath: '',
  origin: '',
  originBenefits: [],
  attributeMethod: 'point-buy',
  attributesBase: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0, size: 0, power: 0, appearance: 0, education: 0 },
  rolledPool: [],
  rolledAssignments: {},
  rollAttempts: 0,
  skillChoices: [],
  startingMoney: 0,
  weaponSimple: '',
  weaponMartial: '',
  armorPick: '',
  shieldPick: '',
  shoppedItems: [],
  spellsPicked: [],
};
