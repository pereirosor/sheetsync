import type { RaceInfo } from '../../types';

export const raceList = [
  'Humano', 'Anão', 'Dahllan', 'Elfo', 'Goblin', 'Lefou', 'Minotauro', 'Qareen',
  'Golem', 'Hynne', 'Kallyanach', 'Kappa', 'Kliren', 'Medusa', 'Meio-Orc', 'Moreau',
  'Nagah', 'Nezumi', 'Ogro', 'Orc', 'Osteon', 'Sereia/Tritão', 'Sílfide',
  'Suraggel (Aggelus)', 'Suraggel (Sulfure)', 'Trog',
];

export const raceData: Record<string, RaceInfo> = {
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
  // Raças complementares (Complemento – Raças)
  'Kallyanach': {
    attributeBonuses: 'SAB +4, CAR +2',
    abilities: ['Asas Divinas', 'Aura Celestial', 'Herança Angélica', 'Resistência ao Mal'],
    attributeMods: { wisdom: 4, charisma: 2 },
  },
  'Kappa': {
    attributeBonuses: 'CON +4, SAB +2, CAR –2',
    abilities: ['Anfíbio', 'Carapaça de Kappa', 'Golpe do Prato', 'Prato Vital'],
    attributeMods: { constitution: 4, wisdom: 2, charisma: -2 },
  },
  'Meio-Orc': {
    attributeBonuses: 'FOR +4, CON +2, INT –2',
    abilities: ['Resistência Orcish', 'Tenacidade', 'Visão no Escuro'],
    attributeMods: { strength: 4, constitution: 2, intelligence: -2 },
  },
  'Moreau': {
    attributeBonuses: '+2 em três atributos à escolha (conforme herança)',
    abilities: ['Herança da Besta', 'Instinto Animal', 'Sentidos Aguçados'],
  },
  'Nagah': {
    attributeBonuses: 'DES +4, CAR +2, FOR –2',
    abilities: ['Sangue Frio', 'Veneno de Nagah', 'Forma Serpentina', 'Língua Bifurcada'],
    attributeMods: { dexterity: 4, charisma: 2, strength: -2 },
  },
  'Nezumi': {
    attributeBonuses: 'DES +4, INT +2, FOR –2',
    abilities: ['Espelunqueiro', 'Faro Apurado', 'Ratazana de Rua', 'Pequeno'],
    attributeMods: { dexterity: 4, intelligence: 2, strength: -2 },
  },
  'Ogro': {
    attributeBonuses: 'FOR +4, CON +4, INT –4',
    abilities: ['Grande', 'Couro Grosso', 'Golpe Devastador Nato', 'Apetite Voraz'],
    attributeMods: { strength: 4, constitution: 4, intelligence: -4 },
  },
  'Orc': {
    attributeBonuses: 'FOR +4, CON +2, INT –2',
    abilities: ['Fúria Orca', 'Resistência à Dor', 'Visão no Escuro', 'Intimidador Nato'],
    attributeMods: { strength: 4, constitution: 2, intelligence: -2 },
  },
};
