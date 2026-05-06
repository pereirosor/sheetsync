export type AttributeKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type VitalKey = 'hp' | 'mana' | 'sanity';

export interface VitalFieldDef {
  key: VitalKey;
  label: string;
  optional: boolean;
  color: string;
}

export interface SkillDef {
  id: string;
  name: string;
  attribute: AttributeKey;
}

export interface VitalPair {
  current: number;
  max: number;
}

export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item';
  bonusOrDamage: string;
  weight: number;
  notes: string;
  diceExpr?: string;
}

export interface SpellItem {
  id: string;
  name: string;
  circleOrLevel: string;
  manaCost: number;
  school: string;
  range: string;
  duration: string;
  description: string;
  diceExpr?: string;
}

export interface DiceRollEntry {
  id: string;
  rollerName: string;
  label: string;
  diceExpr: string;
  breakdown: string;
  total: number;
  timestamp: number;
}

export interface Character {
  id: string;
  campaignCode: string;
  name: string;
  race: string;
  class: string;
  origin: string;
  level: number;
  alignment: string;
  deity: string;
  size: string;
  speed: number;
  vitals: {
    hp: VitalPair;
    mana: VitalPair;
    sanity: VitalPair;
    ac: number;
  };
  attributes: CharacterAttributes;
  skills: Record<string, boolean>;
  equipment: EquipmentItem[];
  spells: SpellItem[];
  notes: string;
  originBenefits: string[];
  actions?: string;
  items?: string;
  owner: 'player' | 'gm';
  inScene: boolean;
}

export interface CampaignSettings {
  sanityEnabled: boolean;
  speedUnit: 'squares' | 'meters';
}

export interface Campaign {
  code: string;
  createdAt: number;
  settings: CampaignSettings;
  playerNames: string[];
  gmCharacterNames: string[];
}

export interface GMCharacterFormData {
  name: string;
  npcType: 'NPC' | 'Monstro';
  race: string;
  charClass: string;
  level: number;
  hpMax: number;
  manaMax: number;
  ac: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  actions: string;
  items: string;
}

export interface RaceInfo {
  attributeBonuses: string;
  abilities: string[];
  attributeMods?: Partial<Record<AttributeKey, number>>;
}

export interface ClassAbility {
  level: number;
  name: string;
  description: string;
}

export interface ClassInfo {
  hpBase: number;
  hpPerLevel: number;
  mpPerLevel: number;
  proficiencies: string;
  level1Abilities: string[];
  abilities: ClassAbility[];
}

export interface GameSystem {
  systemId: string;
  name: string;
  classList: string[];
  originList: string[];
  originData: Record<string, string[]>;
  deityList: string[];
  raceList: string[];
  raceData: Record<string, RaceInfo>;
  classData: Record<string, ClassInfo>;
  skillList: SkillDef[];
  vitalFields: VitalFieldDef[];
  shortRestFormula: (char: Character, campaign: Campaign) => Partial<Record<VitalKey, number>>;
  longRestFormula: (char: Character, campaign: Campaign) => Partial<Record<VitalKey, number>>;
}

export type SyncMessage =
  | { type: 'PLAYER_JOIN'; payload: { campaignCode: string; character: Character } }
  | { type: 'SHEET_UPDATE'; payload: { campaignCode: string; character: Character } }
  | { type: 'GM_VITAL_UPDATE'; payload: { campaignCode: string; characterName: string; field: VitalKey; delta: number } }
  | { type: 'REST_APPLIED'; payload: { campaignCode: string; characterName: string; restType: 'short' | 'long' } }
  | { type: 'CAMPAIGN_SETTINGS_UPDATE'; payload: { campaignCode: string; settings: CampaignSettings } }
  | { type: 'DICE_ROLL'; payload: { campaignCode: string; rollerName: string; label: string; diceExpr: string; breakdown: string; total: number } };

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'damage' | 'heal';
}

export type Role = 'gm' | 'player';
