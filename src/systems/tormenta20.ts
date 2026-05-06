import type { GameSystem, Character, Campaign } from '../types';

const calcMod = (val: number) => Math.floor((val - 10) / 2);

const tormenta20: GameSystem = {
  systemId: 'tormenta20',
  name: 'Tormenta 20',
  classList: [
    'Arcanista', 'Bárbaro', 'Bardo', 'Bucaneiro', 'Caçador', 'Cavaleiro',
    'Clérigo', 'Druida', 'Guerreiro', 'Inventor', 'Ladino', 'Lutador', 'Nobre', 'Paladino',
  ],
  originList: [
    'Acólito', 'Amigo dos Animais', 'Amnésico', 'Aristocrata', 'Artesão',
    'Artista', 'Assistente de Laboratório', 'Batedor', 'Capanga', 'Charlatão',
    'Circense', 'Criminoso', 'Curandeiro', 'Eremita', 'Escravo', 'Estudioso',
    'Fazendeiro', 'Forasteiro', 'Gladiador', 'Guarda', 'Herdeiro',
    'Herói Camponês', 'Marujo', 'Mateiro', 'Membro de Guilda', 'Mercador',
    'Minerador', 'Nômade', 'Pivete', 'Refugiado', 'Seguidor', 'Selvagem',
    'Soldado', 'Taverneiro', 'Trabalhador',
  ],
  deityList: [
    'Aharadak', 'Allihanna', 'Arsenal', 'Azgher', 'Hyninn', 'Kallyadranoch',
    'Khalmyr', 'Lena', 'Lin-Wu', 'Marah', 'Megalokk', 'Nimb', 'Oceano',
    'Sszzaas', 'Tanna-Toh', 'Tenebra', 'Thwor', 'Thyatis', 'Valkaria', 'Wynna',
  ],
  raceList: [
    'Humano', 'Anão', 'Dahllan', 'Elfo', 'Goblin', 'Lefou', 'Minotauro', 'Qareen',
    'Golem', 'Hynne', 'Kliren', 'Medusa', 'Osteon', 'Sereia/Tritão', 'Sílfide',
    'Suraggel (Aggelus)', 'Suraggel (Sulfure)', 'Trog',
  ],
  raceData: {
    'Humano': {
      attributeBonuses: '+2 em três atributos à escolha',
      abilities: ['Versátil', 'Vallen e Drikka'],
      // bônus variáveis — jogador escolhe quais atributos
    },
    'Anão': {
      attributeBonuses: 'CON +4, SAB +2, DES –2',
      abilities: ['Conhecimento das Rochas', 'Devagar e Sempre', 'Duro como Pedra', 'Tradição de Heredrimm'],
      attributeMods: { constitution: 4, wisdom: 2, dexterity: -2 },
    },
    'Dahllan': {
      attributeBonuses: 'SAB +4, DES +2, INT –2',
      abilities: ['Amiga das Plantas', 'Armadura de Allihanna', 'Empatia Selvagem'],
      attributeMods: { wisdom: 4, dexterity: 2, intelligence: -2 },
    },
    'Elfo': {
      attributeBonuses: 'INT +4, DES +2, CON –2',
      abilities: ['Graça de Glórienn', 'Herança Feérica', 'Sentidos Élficos'],
      attributeMods: { intelligence: 4, dexterity: 2, constitution: -2 },
    },
    'Goblin': {
      attributeBonuses: 'DES +4, INT +2, CAR –2',
      abilities: ['Engenhoso', 'Espelunqueiro', 'Peste Esguia', 'Rato das Ruas'],
      attributeMods: { dexterity: 4, intelligence: 2, charisma: -2 },
    },
    'Lefou': {
      attributeBonuses: '+2 em três atributos (exceto CAR), CAR –2',
      abilities: ['Cria da Tormenta', 'Deformidade'],
      attributeMods: { charisma: -2 },
    },
    'Minotauro': {
      attributeBonuses: 'FOR +4, CON +2, SAB –2',
      abilities: ['Chifres', 'Couro Rígido', 'Faro', 'Medo de Altura'],
      attributeMods: { strength: 4, constitution: 2, wisdom: -2 },
    },
    'Qareen': {
      attributeBonuses: 'CAR +4, INT +2, SAB –2',
      abilities: ['Desejos', 'Resistência Elemental', 'Tatuagem Mística'],
      attributeMods: { charisma: 4, intelligence: 2, wisdom: -2 },
    },
    'Golem': {
      attributeBonuses: 'FOR +4, CON +2, CAR –2',
      abilities: ['Canalizar Reparos', 'Chassi', 'Criatura Artificial', 'Espírito Elemental', 'Sem Origem'],
      attributeMods: { strength: 4, constitution: 2, charisma: -2 },
    },
    'Hynne': {
      attributeBonuses: 'DES +4, CAR +2, FOR –2',
      abilities: ['Arremessador', 'Pequeno e Rechonchudo', 'Sorte Salvadora'],
      attributeMods: { dexterity: 4, charisma: 2, strength: -2 },
    },
    'Kliren': {
      attributeBonuses: 'INT +4, CAR +2, FOR –2',
      abilities: ['Híbrido', 'Lógica Gnômica', 'Ossos Frágeis', 'Vanguardista'],
      attributeMods: { intelligence: 4, charisma: 2, strength: -2 },
    },
    'Medusa': {
      attributeBonuses: 'DES +4, CAR +2',
      abilities: ['Cria de Megalokk', 'Natureza Venenosa', 'Olhar Atordoante'],
      attributeMods: { dexterity: 4, charisma: 2 },
    },
    'Osteon': {
      attributeBonuses: '+2 em três atributos (exceto CON), CON –2',
      abilities: ['Armadura Óssea', 'Memória Póstuma', 'Natureza Esquelética', 'Preço da Não Vida'],
      attributeMods: { constitution: -2 },
    },
    'Sereia/Tritão': {
      attributeBonuses: '+2 em três atributos à escolha',
      abilities: ['Canção dos Mares', 'Mestre do Tridente', 'Transformação Anfíbia'],
      // bônus variáveis — jogador escolhe quais atributos
    },
    'Sílfide': {
      attributeBonuses: 'CAR +4, DES +2, FOR –4',
      abilities: ['Asas de Borboleta', 'Espírito da Natureza', 'Magia das Fadas'],
      attributeMods: { charisma: 4, dexterity: 2, strength: -4 },
    },
    'Suraggel (Aggelus)': {
      attributeBonuses: 'SAB +4, CAR +2',
      abilities: ['Herança Divina', 'Luz Sagrada'],
      attributeMods: { wisdom: 4, charisma: 2 },
    },
    'Suraggel (Sulfure)': {
      attributeBonuses: 'DES +4, INT +2',
      abilities: ['Herança Divina', 'Sombras Profanas'],
      attributeMods: { dexterity: 4, intelligence: 2 },
    },
    'Trog': {
      attributeBonuses: 'CON +4, FOR +2, INT –2',
      abilities: ['Mau Cheiro', 'Mordida', 'Reptiliano', 'Sangue Frio'],
      attributeMods: { constitution: 4, strength: 2, intelligence: -2 },
    },
  },
  classData: {
    'Arcanista': {
      hpBase: 8, hpPerLevel: 2, mpPerLevel: 6,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Caminho do Arcanista', 'Magias (1º círculo)'],
    },
    'Bárbaro': {
      hpBase: 24, hpPerLevel: 6, mpPerLevel: 3,
      proficiencies: 'Armas marciais, escudos',
      level1Abilities: ['Fúria +2'],
    },
    'Bardo': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Armas marciais',
      level1Abilities: ['Inspiração +1', 'Magias (1º círculo)'],
    },
    'Bucaneiro': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 3,
      proficiencies: 'Armas marciais',
      level1Abilities: ['Audácia', 'Insolência'],
    },
    'Caçador': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Armas marciais, escudos',
      level1Abilities: ['Marca da Presa +1d4', 'Rastreador'],
    },
    'Cavaleiro': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Baluarte +2', 'Código de Honra'],
    },
    'Clérigo': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 5,
      proficiencies: 'Armaduras pesadas, escudos',
      level1Abilities: ['Devoto', 'Magias (1º círculo)'],
    },
    'Druida': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Escudos',
      level1Abilities: ['Devoto', 'Empatia Selvagem', 'Magias (1º círculo)'],
    },
    'Guerreiro': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Ataque Especial +4'],
    },
    'Inventor': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Engenhosidade', 'Protótipo'],
    },
    'Ladino': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Ataque Furtivo +1d6', 'Especialista'],
    },
    'Lutador': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Briga (1d6)', 'Golpe Relâmpago'],
    },
    'Nobre': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Autoconfiança', 'Espólio', 'Orgulho'],
    },
    'Paladino': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Abençoado', 'Código do Herói', 'Golpe Divino (+1d8)'],
    },
  },
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
