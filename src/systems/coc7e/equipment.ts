// Call of Cthulhu 7e — equipamento, armas e finanças (Guia do Investigador,
// cap. 10 "Referências" + Tabela II: Dinheiro e Patrimônio, pág. 57)

export type CoCEra = '1920s' | 'modern';

export type CoCWeaponCategory = 'melee' | 'pistol' | 'rifle' | 'shotgun';

export interface CoCWeaponDef {
  id: string;
  name: string;
  /** id da perícia CoC usada para atacar (ver coc7e/skills.ts) */
  skill: string;
  /** dano exibido, ex: "1D10", "1D4+2+BD", "4D6/2D6/1D6" */
  damage: string;
  /** parte rolável do dano (sem BD), ex: "1d4+2"; vazio = não rolável */
  baseDice: string;
  range: string;
  usesPerRound: string;
  ammo: string;
  malfunction: string;
  price1920s: number | null;
  priceModern: number | null;
  category: CoCWeaponCategory;
}

export interface CoCItemDef {
  id: string;
  name: string;
  price1920s: number | null;
  priceModern: number | null;
  notes?: string;
}

export const COC_WEAPON_CATEGORY_LABELS: Record<CoCWeaponCategory, string> = {
  melee: 'Corpo a Corpo',
  pistol: 'Pistolas',
  rifle: 'Rifles',
  shotgun: 'Espingardas',
};

// ── Armas (Tabela de Armas, págs. 248-251) ───────────────────────────────────

export const COC_WEAPONS: CoCWeaponDef[] = [
  // Corpo a corpo / comuns
  { id: 'soqueira',        name: 'Soqueira',                       skill: 'lutar-briga',   damage: '1D3+1+BD',     baseDice: '1d3+1', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 1,    priceModern: 10,   category: 'melee' },
  { id: 'blackjack',       name: 'Blackjack (Cassetete)',          skill: 'lutar-briga',   damage: '1D8+BD',       baseDice: '1d8',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 2,    priceModern: 15,   category: 'melee' },
  { id: 'porrete-grande',  name: 'Porrete Grande (bastão)',        skill: 'lutar-briga',   damage: '1D8+BD',       baseDice: '1d8',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 3,    priceModern: 35,   category: 'melee' },
  { id: 'porrete-pequeno', name: 'Porrete Pequeno',                skill: 'lutar-briga',   damage: '1D6+BD',       baseDice: '1d6',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 3,    priceModern: 35,   category: 'melee' },
  { id: 'faca-pequena',    name: 'Faca Pequena (canivete)',        skill: 'lutar-briga',   damage: '1D4+BD',       baseDice: '1d4',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 2,    priceModern: 6,    category: 'melee' },
  { id: 'faca-media',      name: 'Faca Média (faca de cozinha)',   skill: 'lutar-briga',   damage: '1D4+2+BD',     baseDice: '1d4+2', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 2,    priceModern: 15,   category: 'melee' },
  { id: 'faca-grande',     name: 'Faca Grande (facão)',            skill: 'lutar-briga',   damage: '1D8+BD',       baseDice: '1d8',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 4,    priceModern: 50,   category: 'melee' },
  { id: 'machadinha',      name: 'Machadinha / Foicinha',          skill: 'lutar-machado', damage: '1D6+1+BD',     baseDice: '1d6+1', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 3,    priceModern: 9,    category: 'melee' },
  { id: 'machado-lenhador',name: 'Machado de Lenhador',            skill: 'lutar-machado', damage: '1D8+2+BD',     baseDice: '1d8+2', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 5,    priceModern: 10,   category: 'melee' },
  { id: 'espada-leve',     name: 'Espada Leve (florete)',          skill: 'lutar-espada',  damage: '1D6+BD',       baseDice: '1d6',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 25,   priceModern: 100,  category: 'melee' },
  { id: 'espada-media',    name: 'Espada Média (rapieira)',        skill: 'lutar-espada',  damage: '1D6+1+BD',     baseDice: '1d6+1', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 15,   priceModern: 100,  category: 'melee' },
  { id: 'espada-pesada',   name: 'Espada Pesada (sabre)',          skill: 'lutar-espada',  damage: '1D8+1+BD',     baseDice: '1d8+1', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 30,   priceModern: 75,   category: 'melee' },
  { id: 'lanca',           name: 'Lança',                          skill: 'lutar-lanca',   damage: '1D8+1',        baseDice: '1d8+1', range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 25,   priceModern: 150,  category: 'melee' },
  { id: 'chicote',         name: 'Chicote',                        skill: 'lutar-chicote', damage: '1D3+½BD',      baseDice: '1d3',   range: '3 metros',  usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 5,    priceModern: null, category: 'melee' },
  { id: 'garrote',         name: 'Garrote',                        skill: 'lutar-briga',   damage: '1D6+BD',       baseDice: '1d6',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 0.5,  priceModern: 3,    category: 'melee' },
  { id: 'tocha',           name: 'Tocha Acesa',                    skill: 'lutar-briga',   damage: '1D6+queimar',  baseDice: '1d6',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '-',   price1920s: 0.05, priceModern: 0.5,  category: 'melee' },
  { id: 'arco-flecha',     name: 'Arco e Flecha',                  skill: 'arma-fogo-arco',damage: '1D6+½BD',      baseDice: '1d6',   range: '30 metros', usesPerRound: '1',     ammo: '1',  malfunction: '97',  price1920s: 7,    priceModern: 75,   category: 'melee' },
  { id: 'besta',           name: 'Besta',                          skill: 'arma-fogo-arco',damage: '1D8+2',        baseDice: '1d8+2', range: '50 metros', usesPerRound: '1/2',   ammo: '1',  malfunction: '96',  price1920s: 10,   priceModern: 100,  category: 'melee' },
  { id: 'spray-pimenta',   name: 'Spray de Pimenta',               skill: 'lutar-briga',   damage: 'Atordoar',     baseDice: '',      range: '2 metros',  usesPerRound: '1',     ammo: '25', malfunction: '-',   price1920s: null, priceModern: 10,   category: 'melee' },
  { id: 'taser-contato',   name: 'Taser (contato)',                skill: 'lutar-briga',   damage: '1D3+atordoar', baseDice: '1d3',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '97',  price1920s: null, priceModern: 200,  category: 'melee' },
  { id: 'serra-eletrica',  name: 'Serra Elétrica',                 skill: 'lutar-briga',   damage: '2D8',          baseDice: '2d8',   range: 'Toque',     usesPerRound: '1',     ammo: '-',  malfunction: '95',  price1920s: null, priceModern: 300,  category: 'melee' },

  // Pistolas
  { id: 'pistola-22',      name: '.22 Curta Automática',           skill: 'arma-fogo-pistola', damage: '1D6',         baseDice: '1d6',       range: '10 metros', usesPerRound: '1 (3)', ammo: '6',  malfunction: '100', price1920s: 25,   priceModern: 190,  category: 'pistol' },
  { id: 'derringer-25',    name: '.25 Derringer',                  skill: 'arma-fogo-pistola', damage: '1D6',         baseDice: '1d6',       range: '3 metros',  usesPerRound: '1',     ammo: '1',  malfunction: '100', price1920s: 12,   priceModern: null, category: 'pistol' },
  { id: 'revolver-32',     name: 'Revólver .32',                   skill: 'arma-fogo-pistola', damage: '1D8',         baseDice: '1d8',       range: '15 metros', usesPerRound: '1 (3)', ammo: '6',  malfunction: '100', price1920s: 15,   priceModern: 200,  category: 'pistol' },
  { id: 'auto-32',         name: 'Automática .32',                 skill: 'arma-fogo-pistola', damage: '1D8',         baseDice: '1d8',       range: '15 metros', usesPerRound: '1 (3)', ammo: '8',  malfunction: '99',  price1920s: 20,   priceModern: 350,  category: 'pistol' },
  { id: 'revolver-357',    name: 'Revólver .357 Magnum',           skill: 'arma-fogo-pistola', damage: '1D8+1D4',     baseDice: '1d8+1d4',   range: '15 metros', usesPerRound: '1 (3)', ammo: '6',  malfunction: '100', price1920s: null, priceModern: 425,  category: 'pistol' },
  { id: 'revolver-38',     name: 'Revólver .38',                   skill: 'arma-fogo-pistola', damage: '1D10',        baseDice: '1d10',      range: '15 metros', usesPerRound: '1 (3)', ammo: '6',  malfunction: '100', price1920s: 25,   priceModern: 200,  category: 'pistol' },
  { id: 'auto-38',         name: 'Automática .38',                 skill: 'arma-fogo-pistola', damage: '1D10',        baseDice: '1d10',      range: '15 metros', usesPerRound: '1 (3)', ammo: '8',  malfunction: '99',  price1920s: 30,   priceModern: 375,  category: 'pistol' },
  { id: 'beretta-m9',      name: 'Beretta M9',                     skill: 'arma-fogo-pistola', damage: '1D10',        baseDice: '1d10',      range: '15 metros', usesPerRound: '1 (3)', ammo: '15', malfunction: '98',  price1920s: null, priceModern: 500,  category: 'pistol' },
  { id: 'glock-17',        name: 'Glock 17 9mm',                   skill: 'arma-fogo-pistola', damage: '1D10',        baseDice: '1d10',      range: '15 metros', usesPerRound: '1 (3)', ammo: '17', malfunction: '98',  price1920s: null, priceModern: 500,  category: 'pistol' },
  { id: 'luger-p08',       name: 'Luger P08',                      skill: 'arma-fogo-pistola', damage: '1D10',        baseDice: '1d10',      range: '15 metros', usesPerRound: '1 (3)', ammo: '8',  malfunction: '99',  price1920s: 75,   priceModern: 600,  category: 'pistol' },
  { id: 'revolver-45',     name: 'Revólver .45',                   skill: 'arma-fogo-pistola', damage: '1D10+2',      baseDice: '1d10+2',    range: '15 metros', usesPerRound: '1 (3)', ammo: '6',  malfunction: '100', price1920s: 30,   priceModern: 300,  category: 'pistol' },
  { id: 'auto-45',         name: 'Automática .45',                 skill: 'arma-fogo-pistola', damage: '1D10+2',      baseDice: '1d10+2',    range: '15 metros', usesPerRound: '1 (3)', ammo: '7',  malfunction: '100', price1920s: 40,   priceModern: 375,  category: 'pistol' },
  { id: 'desert-eagle',    name: 'IMI Desert Eagle',               skill: 'arma-fogo-pistola', damage: '1D10+1D6+3',  baseDice: '1d10+1d6+3',range: '15 metros', usesPerRound: '1 (3)', ammo: '7',  malfunction: '94',  price1920s: null, priceModern: 650,  category: 'pistol' },

  // Rifles
  { id: 'rifle-22',        name: 'Rifle de Ferrolho .22',          skill: 'arma-fogo-rifle', damage: '1D6+1',          baseDice: '1d6+1',        range: '30 metros',  usesPerRound: '1',   ammo: '6',  malfunction: '99',  price1920s: 13,   priceModern: 70,    category: 'rifle' },
  { id: 'carabina-30',     name: 'Carabina de Alavanca .30',       skill: 'arma-fogo-rifle', damage: '2D6',            baseDice: '2d6',          range: '50 metros',  usesPerRound: '1',   ammo: '6',  malfunction: '98',  price1920s: 19,   priceModern: 150,   category: 'rifle' },
  { id: 'lee-enfield',     name: 'Lee-Enfield .303',               skill: 'arma-fogo-rifle', damage: '2D6+4',          baseDice: '2d6+4',        range: '110 metros', usesPerRound: '1',   ammo: '10', malfunction: '100', price1920s: 50,   priceModern: 300,   category: 'rifle' },
  { id: 'rifle-3006',      name: 'Rifle de Ferrolho .30-06',       skill: 'arma-fogo-rifle', damage: '2D6+4',          baseDice: '2d6+4',        range: '110 metros', usesPerRound: '1',   ammo: '5',  malfunction: '100', price1920s: 75,   priceModern: 175,   category: 'rifle' },
  { id: 'rifle-elefante',  name: 'Rifle de Elefantes (2C)',        skill: 'arma-fogo-rifle', damage: '3D6+4',          baseDice: '3d6+4',        range: '100 metros', usesPerRound: '1 ou 2', ammo: '2', malfunction: '100', price1920s: 400, priceModern: 1800,  category: 'rifle' },
  { id: 'ak-47',           name: 'AK-47 / AKM',                    skill: 'arma-fogo-rifle', damage: '2D6+1',          baseDice: '2d6+1',        range: '100 metros', usesPerRound: '1 (2) ou auto', ammo: '30', malfunction: '100', price1920s: null, priceModern: 200, category: 'rifle' },
  { id: 'barrett-m82',     name: 'Barrett Model 82',               skill: 'arma-fogo-rifle', damage: '2D10+1D8+6',     baseDice: '2d10+1d8+6',   range: '250 metros', usesPerRound: '1',   ammo: '11', malfunction: '96',  price1920s: null, priceModern: 3000,  category: 'rifle' },

  // Espingardas
  { id: 'espingarda-20',   name: 'Espingarda Cal. 20 (2C)',        skill: 'arma-fogo-rifle', damage: '2D6/1D6/1D3',    baseDice: '2d6', range: '10/20/50 m', usesPerRound: '1 ou 2', ammo: '2', malfunction: '100', price1920s: 35,   priceModern: null, category: 'shotgun' },
  { id: 'espingarda-16',   name: 'Espingarda Cal. 16 (2C)',        skill: 'arma-fogo-rifle', damage: '2D6+2/1D6+1/1D4',baseDice: '2d6+2', range: '10/20/50 m', usesPerRound: '1 ou 2', ammo: '2', malfunction: '100', price1920s: 40,   priceModern: null, category: 'shotgun' },
  { id: 'espingarda-12',   name: 'Espingarda Cal. 12 (2C)',        skill: 'arma-fogo-rifle', damage: '4D6/2D6/1D6',    baseDice: '4d6', range: '10/20/50 m', usesPerRound: '1 ou 2', ammo: '2', malfunction: '100', price1920s: 40,   priceModern: 200,  category: 'shotgun' },
  { id: 'escopeta-12',     name: 'Escopeta Cal. 12 (Deslizante)',  skill: 'arma-fogo-rifle', damage: '4D6/2D6/1D6',    baseDice: '4d6', range: '10/20/50 m', usesPerRound: '1',      ammo: '5', malfunction: '100', price1920s: null, priceModern: 100,  category: 'shotgun' },
  { id: 'espingarda-serrada', name: 'Cal. 12 Serrada (2C)',        skill: 'arma-fogo-rifle', damage: '4D6/1D6',        baseDice: '4d6', range: '5/10 m',     usesPerRound: '1 ou 2', ammo: '2', malfunction: '100', price1920s: 45,   priceModern: null, category: 'shotgun' },
  { id: 'benelli-m3',      name: 'Benelli M3 Cal. 12',             skill: 'arma-fogo-rifle', damage: '4D6/2D6/1D6',    baseDice: '4d6', range: '10/20/50 m', usesPerRound: '1 (2)',  ammo: '7', malfunction: '100', price1920s: null, priceModern: 895,  category: 'shotgun' },
  { id: 'spas-12',         name: 'SPAS Cal. 12',                   skill: 'arma-fogo-rifle', damage: '4D6/2D6/1D6',    baseDice: '4d6', range: '10/20/50 m', usesPerRound: '1',      ammo: '8', malfunction: '98',  price1920s: null, priceModern: 600,  category: 'shotgun' },
];

// ── Itens de investigação curados (cap. 10, preços por era) ──────────────────

export const COC_ITEMS: CoCItemDef[] = [
  { id: 'lanterna-eletrica',  name: 'Lanterna Elétrica',             price1920s: 1.35,  priceModern: 10 },
  { id: 'lanterna-querosene', name: 'Lanterna de Querosene',         price1920s: 1.39,  priceModern: null },
  { id: 'velas',              name: 'Velas (12)',                    price1920s: 0.62,  priceModern: 5 },
  { id: 'baterias',           name: 'Baterias',                      price1920s: 0.6,   priceModern: 8 },
  { id: 'fosforos',           name: 'Fósforos à Prova d\'Água',      price1920s: 0.48,  priceModern: 5 },
  { id: 'binoculos',          name: 'Binóculos',                     price1920s: 28.5,  priceModern: 150 },
  { id: 'lupa',               name: 'Lupa de Bolso',                 price1920s: 1.68,  priceModern: 15 },
  { id: 'bussola',            name: 'Bússola de Bolso',              price1920s: 3.25,  priceModern: 20 },
  { id: 'corda-15m',          name: 'Corda (15 metros)',             price1920s: 8.6,   priceModern: 50 },
  { id: 'corda-escalada',     name: 'Corda de Escalada (50 m)',      price1920s: null,  priceModern: 250 },
  { id: 'pe-de-cabra',        name: 'Pé-de-Cabra',                   price1920s: 2.25,  priceModern: 25 },
  { id: 'kit-ferramentas',    name: 'Kit de Ferramentas',            price1920s: 14.9,  priceModern: 500 },
  { id: 'gazuas',             name: 'Ferramentas de Arrombamento',   price1920s: 7.74,  priceModern: 90, notes: '1920s: kit de relojoeiro improvisado' },
  { id: 'cadeado',            name: 'Cadeado',                       price1920s: 0.95,  priceModern: 12 },
  { id: 'algemas',            name: 'Algemas',                       price1920s: 3.35,  priceModern: 40 },
  { id: 'apito-policia',      name: 'Apito de Polícia',              price1920s: 0.3,   priceModern: 5 },
  { id: 'kit-primeiros-socorros', name: 'Kit de Primeiros Socorros', price1920s: 9.98,  priceModern: 60 },
  { id: 'valise-medica',      name: 'Valise Médica',                 price1920s: 39.95, priceModern: 100 },
  { id: 'camera',             name: 'Câmera Fotográfica',            price1920s: 4.49,  priceModern: 450, notes: '1920s: Box Brownie · Moderna: digital SLR' },
  { id: 'camera-descartavel', name: 'Câmera de Bolso Descartável',   price1920s: null,  priceModern: 10 },
  { id: 'filme',              name: 'Filme (24 poses)',              price1920s: 0.38,  priceModern: null },
  { id: 'kit-revelacao',      name: 'Kit de Revelação de Filmes',    price1920s: 4.95,  priceModern: null },
  { id: 'gravador',           name: 'Gravador',                      price1920s: 39.95, priceModern: 300, notes: '1920s: ditafone · Moderna: gravador digital oculto' },
  { id: 'relogio-pulso',      name: 'Relógio de Pulso',              price1920s: 5.95,  priceModern: 50 },
  { id: 'caneta-tinteiro',    name: 'Caneta Tinteiro',               price1920s: 1.8,   priceModern: 10 },
  { id: 'caderno',            name: 'Caderno de Anotações',          price1920s: 0.25,  priceModern: 5 },
  { id: 'maquina-escrever',   name: 'Máquina de Escrever',           price1920s: 40,    priceModern: null },
  { id: 'celular',            name: 'Celular',                       price1920s: null,  priceModern: 50 },
  { id: 'laptop',             name: 'Laptop',                        price1920s: null,  priceModern: 400 },
  { id: 'gps',                name: 'GPS de Mão',                    price1920s: null,  priceModern: 260 },
  { id: 'walkie-talkie',      name: 'Walkie-Talkie',                 price1920s: null,  priceModern: 35 },
  { id: 'visao-noturna',      name: 'Óculos de Visão Noturna',       price1920s: null,  priceModern: 600 },
  { id: 'colete-balistico',   name: 'Colete à Prova de Balas',       price1920s: null,  priceModern: 600 },
  { id: 'mochila',            name: 'Mochila / Mala de Ombro',       price1920s: 3.45,  priceModern: 30 },
  { id: 'cantil',             name: 'Cantil (1 litro)',              price1920s: 1.69,  priceModern: 15 },
  { id: 'barraca',            name: 'Barraca',                       price1920s: 11.48, priceModern: 300, notes: '1920s: 2x2 m · Moderna: geodésica 3 pessoas' },
  { id: 'saco-dormir',        name: 'Saco de Dormir',                price1920s: 5.06,  priceModern: 30, notes: '1920s: cobertor impermeável' },
  { id: 'faca-caca',          name: 'Faca de Caça',                  price1920s: 2.35,  priceModern: 65 },
  { id: 'biblia',             name: 'Bíblia',                        price1920s: 3.98,  priceModern: 10 },
  { id: 'guarda-chuva',       name: 'Guarda-Chuva',                  price1920s: 1.79,  priceModern: 15 },
  { id: 'cigarros',           name: 'Maço de Cigarros',              price1920s: 0.1,   priceModern: 8 },
];

export function weaponPrice(w: CoCWeaponDef, era: CoCEra): number | null {
  return era === 'modern' ? w.priceModern : w.price1920s;
}

export function itemPrice(i: CoCItemDef, era: CoCEra): number | null {
  return era === 'modern' ? i.priceModern : i.price1920s;
}

export function weaponsForEra(era: CoCEra): CoCWeaponDef[] {
  return COC_WEAPONS.filter((w) => weaponPrice(w, era) !== null);
}

export function itemsForEra(era: CoCEra): CoCItemDef[] {
  return COC_ITEMS.filter((i) => itemPrice(i, era) !== null);
}

export const getWeaponById = (id: string) => COC_WEAPONS.find((w) => w.id === id);
export const getItemById = (id: string) => COC_ITEMS.find((i) => i.id === id);

// ── Tabela II: Dinheiro e Patrimônio (pág. 57) ───────────────────────────────

export interface CoCFinance {
  /** faixa de riqueza, ex: "Médio" */
  bracket: string;
  /** dinheiro prontamente disponível ($) */
  cash: number;
  /** patrimônio total ($); imóveis/investimentos */
  assets: number;
  /** Nível de Gastos: até este valor não há contabilidade */
  spendingLevel: number;
}

export function financeFromCredit(credit: number, era: CoCEra): CoCFinance {
  const nc = Math.max(0, Math.floor(credit));
  if (era === 'modern') {
    if (nc <= 0)  return { bracket: 'Pobretão', cash: 10,         assets: 0,            spendingLevel: 10 };
    if (nc <= 9)  return { bracket: 'Pobre',    cash: nc * 20,    assets: nc * 200,     spendingLevel: 40 };
    if (nc <= 49) return { bracket: 'Médio',    cash: nc * 40,    assets: nc * 1000,    spendingLevel: 200 };
    if (nc <= 89) return { bracket: 'Abastado', cash: nc * 100,   assets: nc * 10000,   spendingLevel: 1000 };
    if (nc <= 98) return { bracket: 'Rico',     cash: nc * 400,   assets: nc * 40000,   spendingLevel: 5000 };
    return         { bracket: 'Ricaço',   cash: 1_000_000,  assets: 100_000_000,  spendingLevel: 100000 };
  }
  if (nc <= 0)  return { bracket: 'Pobretão', cash: 0.5,        assets: 0,            spendingLevel: 0.5 };
  if (nc <= 9)  return { bracket: 'Pobre',    cash: nc * 1,     assets: nc * 10,      spendingLevel: 2 };
  if (nc <= 49) return { bracket: 'Médio',    cash: nc * 2,     assets: nc * 50,      spendingLevel: 10 };
  if (nc <= 89) return { bracket: 'Abastado', cash: nc * 5,     assets: nc * 500,     spendingLevel: 50 };
  if (nc <= 98) return { bracket: 'Rico',     cash: nc * 20,    assets: nc * 2000,    spendingLevel: 250 };
  return         { bracket: 'Ricaço',   cash: 50_000,     assets: 5_000_000,    spendingLevel: 5000 };
}

/** Formata valor em dólares: $1,234.56 (sem decimais quando inteiro) */
export function formatMoney(value: number): string {
  const hasCents = Math.abs(value % 1) > 0.001;
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}
