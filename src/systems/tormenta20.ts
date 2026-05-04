import type { GameSystem, Character, Campaign } from '../types';

const calcMod = (val: number) => Math.floor((val - 10) / 2);

const tormenta20: GameSystem = {
  systemId: 'tormenta20',
  name: 'Tormenta 20',
  classList: [
    'Arcanista',
    'Bárbaro',
    'Bardo',
    'Clérigo',
    'Druida',
    'Guerreiro',
    'Inventor',
    'Ladino',
    'Paladino',
    'Ranger',
    'Lutador',
    'Nobre',
    'Caçador de Monstros',
  ],
  vitalFields: [
    { key: 'hp', label: 'PV', optional: false, color: '#e05252' },
    { key: 'mana', label: 'Mana', optional: false, color: '#5281e0' },
    { key: 'sanity', label: 'Sanidade', optional: true, color: '#9b5de5' },
  ],
  skillList: [
    { id: 'acrobacia', name: 'Acrobacia', attribute: 'dexterity' },
    { id: 'adestramento', name: 'Adestramento', attribute: 'wisdom' },
    { id: 'atletismo', name: 'Atletismo', attribute: 'strength' },
    { id: 'atuacao', name: 'Atuação', attribute: 'charisma' },
    { id: 'cavalgar', name: 'Cavalgar', attribute: 'dexterity' },
    { id: 'conhecimento_arcano', name: 'Conhecimento (Arcano)', attribute: 'intelligence' },
    { id: 'conhecimento_natureza', name: 'Conhecimento (Natureza)', attribute: 'intelligence' },
    { id: 'conhecimento_dungeons', name: 'Conhecimento (Dungeons)', attribute: 'intelligence' },
    { id: 'conhecimento_plano', name: 'Conhecimento (Plano Espiritual)', attribute: 'intelligence' },
    { id: 'conhecimento_nobre', name: 'Conhecimento (Nobre)', attribute: 'intelligence' },
    { id: 'conhecimento_religioso', name: 'Conhecimento (Religioso)', attribute: 'intelligence' },
    { id: 'cura', name: 'Cura', attribute: 'wisdom' },
    { id: 'diplomacia', name: 'Diplomacia', attribute: 'charisma' },
    { id: 'enganacao', name: 'Enganação', attribute: 'charisma' },
    { id: 'fortitude', name: 'Fortitude', attribute: 'constitution' },
    { id: 'furtividade', name: 'Furtividade', attribute: 'dexterity' },
    { id: 'guerra', name: 'Guerra', attribute: 'intelligence' },
    { id: 'iniciativa', name: 'Iniciativa', attribute: 'dexterity' },
    { id: 'intimidacao', name: 'Intimidação', attribute: 'charisma' },
    { id: 'intuicao', name: 'Intuição', attribute: 'wisdom' },
    { id: 'investigacao', name: 'Investigação', attribute: 'intelligence' },
    { id: 'jogatina', name: 'Jogatina', attribute: 'charisma' },
    { id: 'ladinagem', name: 'Ladinagem', attribute: 'dexterity' },
    { id: 'luta', name: 'Luta', attribute: 'strength' },
    { id: 'misticismo', name: 'Misticismo', attribute: 'intelligence' },
    { id: 'nobreza', name: 'Nobreza', attribute: 'intelligence' },
    { id: 'oficio', name: 'Ofício', attribute: 'intelligence' },
    { id: 'percepcao', name: 'Percepção', attribute: 'wisdom' },
    { id: 'pilotagem', name: 'Pilotagem', attribute: 'dexterity' },
    { id: 'pontaria', name: 'Pontaria', attribute: 'dexterity' },
    { id: 'reflexos', name: 'Reflexos', attribute: 'dexterity' },
    { id: 'religiao', name: 'Religião', attribute: 'wisdom' },
    { id: 'sobrevivencia', name: 'Sobrevivência', attribute: 'wisdom' },
    { id: 'vontade', name: 'Vontade', attribute: 'wisdom' },
  ],
  shortRestFormula: (char: Character, _campaign: Campaign) => {
    const conMod = Math.max(1, calcMod(char.attributes.constitution));
    const hpGain = char.level * conMod;
    const spellMod = Math.max(
      1,
      calcMod(char.attributes.intelligence),
      calcMod(char.attributes.wisdom),
    );
    const manaGain = char.vitals.mana.max > 0 ? char.level * spellMod : 0;
    return { hp: hpGain, mana: manaGain };
  },
  longRestFormula: (char: Character, _campaign: Campaign) => ({
    hp: char.vitals.hp.max,
    mana: char.vitals.mana.max,
    sanity: char.vitals.sanity.max,
  }),
};

export default tormenta20;

export const calcMod2 = calcMod;

export const skillTotal = (
  attrValue: number,
  trained: boolean,
  level: number,
): number => {
  const mod = calcMod(attrValue);
  const trainingBonus = trained ? 4 + Math.floor(level / 2) : 0;
  return mod + trainingBonus;
};
