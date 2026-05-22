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

export interface SpellAmplification {
  cost: number;
  effect: string;
}

export interface WeaponRef {
  damage: string;
  damageType: string;
  critical: string;
  range: string;
  weight: number;
  category: 'simples' | 'marcial' | 'exótica' | 'fogo';
  properties?: string;
}

export interface ArmorRef {
  defenseBonus: string;
  penalty: string;
  weight: number;
  type: 'leve' | 'pesada' | 'escudo';
}

export interface GeneralItemRef {
  weight: number;
  description?: string;
}

export interface SpellRef {
  spellType: 'arcana' | 'divina' | 'universal';
  circle: number;
  school: string;
  castingTime: string;
  range: string;
  area?: string;
  target?: string;
  effect?: string;
  duration: string;
  resistance?: string;
  description: string;
  amplifications: SpellAmplification[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item';
  bonusOrDamage: string;
  weight: number;
  notes: string;
  diceExpr?: string;
  damage?: string;
  damageType?: string;
  critical?: string;
  properties?: string;
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
  amplifications?: SpellAmplification[];
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

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
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
  avatarDataUrl?: string;
  created: boolean;
  classPath?: string;
  raceBonusChoices?: Partial<Record<AttributeKey, number>>;
  conditions?: string[];
  powers?: { name: string; level: number }[];
  pendingLevelUp?: boolean;
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

export interface SkillChoiceGroup {
  count: number;
  options: string[];
}

export interface ClassInfo {
  hpBase: number;
  hpPerLevel: number;
  mpPerLevel: number;
  proficiencies: string;
  level1Abilities: string[];
  abilities: ClassAbility[];
  trainedSkills: string[];
  skillChoices: SkillChoiceGroup[];
}

export interface ClassProficiencyInfo {
  martialWeapons: boolean;
  heavyArmor: boolean;
  shields: boolean;
}

export type PowerGroup = 'Combate' | 'Destino' | 'Magia' | 'Concedidos' | 'Tormenta';

export interface PowerPrereqs {
  raw: string;
  attributes?: Partial<Record<AttributeKey, number>>;
  powers?: string[];
  skillsTrained?: string[];
  minLevel?: number;
  other?: string[];
}

export interface GeneralPower {
  name: string;
  group: PowerGroup;
  description: string;
  prereqs?: PowerPrereqs;
}

export interface CasterProgression {
  startingSpells: number;
  spellsPerLevel: number;
  evenLevelsOnly?: boolean;
  circleAtLevel: Record<number, number>;
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
  weaponData: Record<string, WeaponRef>;
  armorData: Record<string, ArmorRef>;
  generalItemData: Record<string, GeneralItemRef>;
  spellData: Record<string, SpellRef>;
  classMagicType: Record<string, 'arcana' | 'divina' | null>;
  classStartingSpells: Record<string, number>;
  classPaths: Record<string, string[]>;
  classProficiencies: Record<string, ClassProficiencyInfo>;
  variableBonusRaces: string[];
  classProgression: Record<string, string[][]>;
  casterProgression: Record<string, CasterProgression>;
  generalPowers: GeneralPower[];
}

export interface CombatantEntry {
  name: string;
  initiative: number;
  isNPC: boolean;
}

export interface CombatState {
  active: boolean;
  combatants: CombatantEntry[];
  currentIndex: number;
  round: number;
}

export type SyncMessage =
  | { type: 'PLAYER_JOIN'; payload: { campaignCode: string; character: Character } }
  | { type: 'SHEET_UPDATE'; payload: { campaignCode: string; character: Character } }
  | { type: 'GM_VITAL_UPDATE'; payload: { campaignCode: string; characterName: string; field: VitalKey; delta: number } }
  | { type: 'REST_APPLIED'; payload: { campaignCode: string; characterName: string; restType: 'short' | 'long' } }
  | { type: 'CAMPAIGN_SETTINGS_UPDATE'; payload: { campaignCode: string; settings: CampaignSettings } }
  | { type: 'DICE_ROLL'; payload: { campaignCode: string; rollerName: string; label: string; diceExpr: string; breakdown: string; total: number } }
  | { type: 'CHAT_MESSAGE'; payload: { campaignCode: string; senderName: string; text: string } }
  | { type: 'COMBAT_REQUEST'; payload: { campaignCode: string } }
  | { type: 'COMBAT_INITIATIVE_ROLL'; payload: { campaignCode: string; characterName: string; roll: number } }
  | { type: 'COMBAT_CANCEL'; payload: { campaignCode: string } }
  | { type: 'COMBAT_START'; payload: { campaignCode: string; combatants: CombatantEntry[] } }
  | { type: 'COMBAT_NEXT_TURN'; payload: { campaignCode: string; currentIndex: number; round: number } }
  | { type: 'COMBAT_END'; payload: { campaignCode: string } }
  | { type: 'LEVEL_UP_RELEASED'; payload: { campaignCode: string } }
  | { type: 'LEVEL_UP_RESET'; payload: { campaignCode: string } };

export interface GMNote {
  id: string;
  campaignCode: string;
  title: string;
  body: string;
  createdAt: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'damage' | 'heal';
}

export type Role = 'gm' | 'player';
