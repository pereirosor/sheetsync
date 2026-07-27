import tormenta20, { calcMod2 } from '../../systems/tormenta20';
import type { AttributeKey, EquipmentItem } from '../../types';

export const T20_ATTRS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
export type T20AttributeKey = (typeof T20_ATTRS)[number];
export type AttributeMethod = 'point-buy' | 'roll' | 'manual';

export const MANUAL_MIN = 1;
export const MANUAL_MAX = 30;

export const EMPTY_ATTR_BASE: Record<AttributeKey, number> = {
  strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0,
  size: 0, power: 0, appearance: 0, education: 0,
};

export const DEFAULT_MANUAL_ATTRS: Record<T20AttributeKey, number> = {
  strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
};

export interface WizardState {
  race: string;
  raceBonusChoices: Partial<Record<AttributeKey, number>>;
  charClass: string;
  classPath: string;
  origin: string;
  originBenefits: string[];
  attributeMethod: AttributeMethod;
  attributesBase: Record<AttributeKey, number>;
  attributesManual: Record<T20AttributeKey, number>;
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
  attributesBase: { ...EMPTY_ATTR_BASE },
  attributesManual: { ...DEFAULT_MANUAL_ATTRS },
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

/** Mods raciais (fixos + escolhas +2). Apenas referência no modo manual — não somados ao valor final. */
export function getRaceMods(state: WizardState): Record<T20AttributeKey, number> {
  const fixed = (tormenta20.raceData[state.race]?.attributeMods ?? {}) as Partial<Record<AttributeKey, number>>;
  const variable = state.raceBonusChoices ?? {};
  const out = {} as Record<T20AttributeKey, number>;
  for (const a of T20_ATTRS) out[a] = (fixed[a] ?? 0) + (variable[a] ?? 0);
  return out;
}

/** Fonte única de verdade dos atributos finais T20 — usada no preview, na revisão e no save. */
export function computeFinalAttributes(state: WizardState): Record<T20AttributeKey, number> {
  if (state.attributeMethod === 'manual') {
    // Valores digitados são finais — a ficha de papel já inclui os bônus raciais.
    return { ...state.attributesManual };
  }
  const race = getRaceMods(state);
  const out = {} as Record<T20AttributeKey, number>;
  for (const a of T20_ATTRS) out[a] = 10 + state.attributesBase[a] + race[a];
  return out;
}

/** PV/Mana derivados dos atributos finais. null enquanto não há classe escolhida. */
export function computeDerivedVitals(state: WizardState, level = 1): { hpMax: number; manaMax: number } | null {
  const cd = tormenta20.classData[state.charClass];
  if (!cd) return null;
  const conMod = calcMod2(computeFinalAttributes(state).constitution);
  return {
    hpMax: cd.hpBase + conMod + (level - 1) * cd.hpPerLevel,
    manaMax: cd.mpPerLevel * level,
  };
}
