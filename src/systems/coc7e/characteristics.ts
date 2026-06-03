export interface CoCCharacteristics {
  strength: number;     // FOR — 3D6×5
  constitution: number; // CON — 3D6×5
  size: number;         // TAM — (2D6+6)×5
  dexterity: number;    // DES — 3D6×5
  appearance: number;   // APA — 3D6×5
  intelligence: number; // INT — (2D6+6)×5
  power: number;        // POD — 3D6×5
  education: number;    // EDU — (2D6+6)×5
}

export interface CharacteristicDef {
  key: keyof CoCCharacteristics;
  name: string;
  abbr: string;
  diceFormula: '3D6' | '2D6+6';
}

export const CHARACTERISTIC_DEFS: CharacteristicDef[] = [
  { key: 'strength',     name: 'Força',        abbr: 'FOR', diceFormula: '3D6' },
  { key: 'constitution', name: 'Constituição',  abbr: 'CON', diceFormula: '3D6' },
  { key: 'size',         name: 'Tamanho',       abbr: 'TAM', diceFormula: '2D6+6' },
  { key: 'dexterity',    name: 'Destreza',      abbr: 'DES', diceFormula: '3D6' },
  { key: 'appearance',   name: 'Aparência',     abbr: 'APA', diceFormula: '3D6' },
  { key: 'intelligence', name: 'Inteligência',  abbr: 'INT', diceFormula: '2D6+6' },
  { key: 'power',        name: 'Poder',         abbr: 'POD', diceFormula: '3D6' },
  { key: 'education',    name: 'Educação',      abbr: 'EDU', diceFormula: '2D6+6' },
];

const d6 = () => Math.floor(Math.random() * 6) + 1;

export function rollCharacteristic(formula: '3D6' | '2D6+6'): number {
  if (formula === '3D6') return (d6() + d6() + d6()) * 5;
  return (d6() + d6() + 6) * 5;
}

export function rollAllCharacteristics(): CoCCharacteristics {
  return {
    strength:     (d6() + d6() + d6()) * 5,
    constitution: (d6() + d6() + d6()) * 5,
    size:         (d6() + d6() + 6) * 5,
    dexterity:    (d6() + d6() + d6()) * 5,
    appearance:   (d6() + d6() + d6()) * 5,
    intelligence: (d6() + d6() + 6) * 5,
    power:        (d6() + d6() + d6()) * 5,
    education:    (d6() + d6() + 6) * 5,
  };
}

// Point-buy: distribute 460 points across 8 characteristics (15–90 each)
export const POINTBUY_TOTAL = 460;
export const CHAR_MIN = 15;
export const CHAR_MAX = 90;

export function quickstartCharacteristics(): CoCCharacteristics {
  // Distribute 40/50/50/50/60/60/70/80 as suggested in the book
  const vals = [40, 50, 50, 50, 60, 60, 70, 80];
  const keys = Object.keys({
    strength: 0, constitution: 0, size: 0, dexterity: 0,
    appearance: 0, intelligence: 0, power: 0, education: 0,
  }) as (keyof CoCCharacteristics)[];
  return Object.fromEntries(keys.map((k, i) => [k, vals[i]])) as unknown as CoCCharacteristics;
}

// Derived stats
export function calcHP(con: number, tam: number): number {
  return Math.floor((con + tam) / 10);
}
export function calcMP(pod: number): number {
  return Math.floor(pod / 5);
}
export function calcSAN(pod: number): number {
  return pod;
}
export function calcLuck(): number {
  return (d6() + d6() + d6()) * 5;
}

export function calcMOV(str: number, dex: number, tam: number, age: number): number {
  let mov: number;
  if (str < tam && dex < tam) mov = 7;
  else if (str > tam && dex > tam) mov = 9;
  else mov = 8;
  if (age >= 80) mov -= 5;
  else if (age >= 70) mov -= 4;
  else if (age >= 60) mov -= 3;
  else if (age >= 50) mov -= 2;
  else if (age >= 40) mov -= 1;
  return Math.max(1, mov);
}

export interface DamageBonusEntry {
  sumMin: number; sumMax: number;
  damageBonus: string; build: number;
}
export const DAMAGE_BONUS_TABLE: DamageBonusEntry[] = [
  { sumMin: 2,   sumMax: 64,  damageBonus: '-2',      build: -2 },
  { sumMin: 65,  sumMax: 84,  damageBonus: '-1',       build: -1 },
  { sumMin: 85,  sumMax: 124, damageBonus: 'Nenhum',   build:  0 },
  { sumMin: 125, sumMax: 164, damageBonus: '+1D4',     build:  1 },
  { sumMin: 165, sumMax: 204, damageBonus: '+1D6',     build:  2 },
];
export function getDamageBonus(str: number, tam: number): DamageBonusEntry {
  const sum = str + tam;
  return DAMAGE_BONUS_TABLE.find(e => sum >= e.sumMin && sum <= e.sumMax) ?? DAMAGE_BONUS_TABLE[2];
}

// Age modifiers (applied to rolled characteristics)
export interface AgeModifier {
  minAge: number; maxAge: number;
  eduChecks: number;
  // reductions split among the listed stats
  physReduction: number; // distribute among FOR, CON, DES
  apaReduction: number;
  doubleLuck: boolean;
}
export const AGE_MODIFIERS: AgeModifier[] = [
  { minAge: 15, maxAge: 19, eduChecks: 0, physReduction: 5,  apaReduction: 0,  doubleLuck: true  },
  { minAge: 20, maxAge: 39, eduChecks: 1, physReduction: 0,  apaReduction: 0,  doubleLuck: false },
  { minAge: 40, maxAge: 49, eduChecks: 2, physReduction: 5,  apaReduction: 5,  doubleLuck: false },
  { minAge: 50, maxAge: 59, eduChecks: 3, physReduction: 10, apaReduction: 10, doubleLuck: false },
  { minAge: 60, maxAge: 69, eduChecks: 4, physReduction: 20, apaReduction: 15, doubleLuck: false },
  { minAge: 70, maxAge: 79, eduChecks: 4, physReduction: 40, apaReduction: 20, doubleLuck: false },
  { minAge: 80, maxAge: 90, eduChecks: 4, physReduction: 80, apaReduction: 25, doubleLuck: false },
];
export function getAgeModifier(age: number): AgeModifier | null {
  return AGE_MODIFIERS.find(m => age >= m.minAge && age <= m.maxAge) ?? null;
}
// EDU improvement check: roll d100 > current EDU → add 1D10
export function eduImprovementCheck(currentEdu: number): number {
  const roll = Math.floor(Math.random() * 100) + 1;
  if (roll > currentEdu) {
    const gain = Math.floor(Math.random() * 10) + 1;
    return Math.min(99, currentEdu + gain);
  }
  return currentEdu;
}
