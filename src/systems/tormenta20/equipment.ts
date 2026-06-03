import type { WeaponRef, ArmorRef, GeneralItemRef } from '../../types';

export const weaponData: Record<string, WeaponRef> = {
  // Armas Simples — Leves
  'Adaga':              { damage: '1d4',     damageType: 'Perfuração',        critical: '19',    range: 'Curto', weight: 0.5, category: 'simples', properties: 'Leve, Ágil, Arremesso',                                price: 2   },
  'Ataque Desarmado':   { damage: '1d3',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 0,   category: 'simples', properties: 'Leve, Dano não-letal',                                  price: 0   },
  'Espada Curta':       { damage: '1d6',     damageType: 'Perfuração',        critical: '19',    range: '',      weight: 1,   category: 'simples', properties: 'Leve',                                                  price: 10  },
  'Foice':              { damage: '1d6',     damageType: 'Corte',             critical: 'x3',    range: '',      weight: 1,   category: 'simples', properties: 'Leve',                                                  price: 4   },
  'Manopla':            { damage: '1d4',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 1,   category: 'simples', properties: 'Leve, Não pode ser desarmada',                          price: 5   },
  // Armas Simples — Uma Mão
  'Clava':              { damage: '1d6',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 1.5, category: 'simples',                                                                      price: 0   },
  'Lança':              { damage: '1d6',     damageType: 'Perfuração',        critical: 'x2',    range: 'Curto', weight: 1.5, category: 'simples', properties: 'Arremesso',                                             price: 2   },
  'Maça':               { damage: '1d8',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 6,   category: 'simples',                                                                      price: 12  },
  // Armas Simples — Duas Mãos
  'Bordão':             { damage: '1d6/1d6', damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 2,   category: 'simples', properties: 'Dupla, Duas mãos',                                      price: 0   },
  'Pique':              { damage: '1d8',     damageType: 'Perfuração',        critical: 'x2',    range: '',      weight: 5,   category: 'simples', properties: 'Alongada, Duas mãos',                                   price: 2   },
  'Tacape':             { damage: '1d10',    damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 4,   category: 'simples', properties: 'Duas mãos',                                             price: 0   },
  // Armas Simples — Distância
  'Arco Curto':         { damage: '1d6',     damageType: 'Perfuração',        critical: 'x3',    range: 'Médio', weight: 1,   category: 'simples', properties: 'Duas mãos',                                             price: 30  },
  'Besta Leve':         { damage: '1d8',     damageType: 'Perfuração',        critical: '19',    range: 'Médio', weight: 3,   category: 'simples', properties: 'Duas mãos, Recarregar ação de movimento',                price: 35  },
  'Azagaia':            { damage: '1d6',     damageType: 'Perfuração',        critical: 'x2',    range: 'Médio', weight: 1,   category: 'simples', properties: 'Arremesso',                                             price: 1   },
  'Funda':              { damage: '1d4',     damageType: 'Impacto',           critical: 'x2',    range: 'Médio', weight: 0.25, category: 'simples', properties: '+FOR no dano',                                         price: 0   },
  // Armas Simples — Complemento
  'Porrete':            { damage: '1d6',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 1.5, category: 'simples',                                                                      price: 2   },
  'Machado de Lenha':   { damage: '1d6',     damageType: 'Corte',             critical: 'x3',    range: '',      weight: 2,   category: 'simples', properties: 'Leve',                                                  price: 15  },
  'Zarabatana':         { damage: '1d3',     damageType: 'Perfuração',        critical: 'x2',    range: 'Curto', weight: 0.5, category: 'simples', properties: 'Leve, Dardos c/veneno',                                 price: 5   },
  // Armas Marciais — Leves
  'Machadinha':         { damage: '1d6',     damageType: 'Corte',             critical: 'x3',    range: 'Curto', weight: 2,   category: 'marcial', properties: 'Leve, Arremesso',                                       price: 6   },
  // Armas Marciais — Uma Mão
  'Cimitarra':          { damage: '1d6',     damageType: 'Corte',             critical: '18',    range: '',      weight: 2,   category: 'marcial', properties: 'Ágil',                                                  price: 15  },
  'Espada Longa':       { damage: '1d8',     damageType: 'Corte',             critical: '19',    range: '',      weight: 2,   category: 'marcial',                                                                      price: 15  },
  'Florete':            { damage: '1d6',     damageType: 'Perfuração',        critical: '18',    range: '',      weight: 1,   category: 'marcial', properties: 'Ágil',                                                  price: 20  },
  'Machado de Batalha': { damage: '1d8',     damageType: 'Corte',             critical: 'x3',    range: '',      weight: 3,   category: 'marcial',                                                                      price: 10  },
  'Mangual':            { damage: '1d8',     damageType: 'Impacto',           critical: 'x2',    range: '',      weight: 2.5, category: 'marcial', properties: 'Versátil (+2 para desarmar)',                            price: 8   },
  'Martelo de Guerra':  { damage: '1d8',     damageType: 'Impacto',           critical: 'x3',    range: '',      weight: 2.5, category: 'marcial',                                                                      price: 12  },
  'Picareta':           { damage: '1d6',     damageType: 'Perfuração',        critical: 'x4',    range: '',      weight: 3,   category: 'marcial',                                                                      price: 8   },
  'Tridente':           { damage: '1d8',     damageType: 'Perfuração',        critical: 'x2',    range: '',      weight: 2,   category: 'marcial', properties: 'Versátil (+2 para derrubar)',                            price: 15  },
  // Armas Marciais — Duas Mãos
  'Alabarda':           { damage: '1d10',    damageType: 'Corte/Perfuração',  critical: 'x3',    range: '',      weight: 6,   category: 'marcial', properties: 'Alongada, Duas mãos',                                   price: 10  },
  'Alfange':            { damage: '2d4',     damageType: 'Corte',             critical: '18',    range: '',      weight: 4,   category: 'marcial', properties: 'Duas mãos',                                             price: 75  },
  'Gadanho':            { damage: '2d4',     damageType: 'Corte',             critical: 'x4',    range: '',      weight: 5,   category: 'marcial', properties: 'Duas mãos',                                             price: 18  },
  'Lança Montada':      { damage: '1d8',     damageType: 'Perfuração',        critical: 'x3',    range: '',      weight: 5,   category: 'marcial', properties: 'Alongada, Duas mãos, +2d8 em investida montada',         price: 10  },
  'Machado de Guerra':  { damage: '1d12',    damageType: 'Corte',             critical: 'x3',    range: '',      weight: 6,   category: 'marcial', properties: 'Duas mãos',                                             price: 20  },
  'Montante':           { damage: '2d6',     damageType: 'Corte',             critical: '19',    range: '',      weight: 4,   category: 'marcial', properties: 'Duas mãos',                                             price: 50  },
  // Armas Marciais — Distância
  'Arco Longo':         { damage: '1d8',     damageType: 'Perfuração',        critical: 'x3',    range: 'Médio', weight: 1.5, category: 'marcial', properties: 'Duas mãos, +FOR no dano',                               price: 100 },
  'Besta Pesada':       { damage: '1d12',    damageType: 'Perfuração',        critical: '19',    range: 'Médio', weight: 4,   category: 'marcial', properties: 'Duas mãos, Recarregar ação padrão',                      price: 50  },
  // Armas Marciais — Complemento
  'Neko-te':            { damage: '1d4',     damageType: 'Corte',             critical: '19',    range: '',      weight: 0.5, category: 'marcial', properties: 'Leve',                                                  price: 10  },
  'Gládio':             { damage: '1d6',     damageType: 'Perfuração',        critical: '19/x3', range: '',      weight: 1,   category: 'marcial',                                                                      price: 12  },
  'Lâmina de Espinhos': { damage: '1d8',     damageType: 'Corte',             critical: '19',    range: '',      weight: 2,   category: 'marcial', properties: 'Espinhosa',                                             price: 6000},
  'Tetsubo':            { damage: '2d6',     damageType: 'Impacto',           critical: '19/x3', range: '',      weight: 5,   category: 'marcial', properties: 'Duas mãos',                                             price: 20  },
  // Armas Exóticas
  'Chicote':            { damage: '1d3',     damageType: 'Corte',             critical: 'x2',    range: '',      weight: 1,   category: 'exótica', properties: 'Ágil, Versátil (+2 derrubar/desarmar), Alcance 4,5m',   price: 2   },
  'Espada Bastarda':    { damage: '1d10/1d12', damageType: 'Corte',           critical: '19',    range: '',      weight: 3,   category: 'exótica', properties: 'Adaptável (duas mãos: 1d12 marcial)',                    price: 35  },
  'Katana':             { damage: '1d8/1d10', damageType: 'Corte',            critical: '19',    range: '',      weight: 2.5, category: 'exótica', properties: 'Adaptável, Ágil',                                       price: 100 },
  'Machado Anão':       { damage: '1d10',    damageType: 'Corte',             critical: 'x3',    range: '',      weight: 4,   category: 'exótica', properties: 'Adaptável (duas mãos: marcial)',                         price: 30  },
  'Corrente de Espinhos': { damage: '2d4/2d4', damageType: 'Corte',          critical: '19',    range: '',      weight: 5,   category: 'exótica', properties: 'Dupla, Ágil, Versátil (+2 derrubar/desarmar), Alcance 4,5m, Duas mãos', price: 25 },
  'Machado Táurico':    { damage: '2d8',     damageType: 'Corte',             critical: 'x3',    range: '',      weight: 12,  category: 'exótica', properties: 'Duas mãos, –2 nos ataques',                              price: 50  },
  'Rede':               { damage: '—',       damageType: '—',                 critical: '—',     range: 'Curto', weight: 3,   category: 'exótica', properties: 'Sem dano — alvo fica enredado',                          price: 20  },
  // Armas Exóticas — Complemento
  'Wakizashi':          { damage: '1d6',     damageType: 'Corte',             critical: '19',    range: '',      weight: 1,   category: 'exótica', properties: 'Leve, Ágil',                                            price: 75  },
  'Açoite Finntroll':   { damage: '1d8',     damageType: 'Corte',             critical: 'x2',    range: '',      weight: 1.5, category: 'exótica', properties: 'Alcance 4,5m',                                          price: 30  },
  'Atigili':            { damage: '1d8',     damageType: 'Corte',             critical: '19',    range: '',      weight: 3,   category: 'exótica', properties: 'Dupla, Duas mãos',                                      price: 150 },
  'Espada Vespa':       { damage: '2d4',     damageType: 'Corte/Perfuração',  critical: '18',    range: '',      weight: 2,   category: 'exótica', properties: 'Ágil',                                                  price: 75  },
  'Mordida do Diabo':   { damage: '1d4',     damageType: 'Perfuração',        critical: 'x2',    range: '',      weight: 0.5, category: 'exótica', properties: 'Leve, Dupla',                                           price: 30  },
  'Presa da Serpente':  { damage: '1d8',     damageType: 'Corte',             critical: '17',    range: '',      weight: 2,   category: 'exótica', properties: 'Margem de ameaça 17-20',                                 price: 1000},
  'Shuriken':           { damage: '1d4',     damageType: 'Perfuração',        critical: 'x2',    range: 'Curto', weight: 0.1, category: 'exótica', properties: 'Leve, Arremesso',                                       price: 1   },
  'Arpão':              { damage: '1d10',    damageType: 'Perfuração',        critical: 'x3',    range: 'Médio', weight: 2,   category: 'exótica', properties: 'Arremesso',                                             price: 30  },
  'Balestra':           { damage: '1d12',    damageType: 'Perfuração',        critical: '19',    range: 'Médio', weight: 4,   category: 'exótica', properties: 'Duas mãos, Recarregar ação padrão',                      price: 150 },
  // Armas de Fogo
  'Mosquete':           { damage: '2d8',     damageType: 'Perfuração',        critical: '19/x3', range: 'Médio', weight: 4,   category: 'fogo',    properties: 'Duas mãos, Recarregar ação padrão',                      price: 500 },
  'Pistola':            { damage: '2d6',     damageType: 'Perfuração',        critical: '19/x3', range: 'Curto', weight: 1,   category: 'fogo',    properties: 'Leve, Recarregar ação padrão',                           price: 250 },
  // Armas de Fogo — Complemento
  'Traque':             { damage: '2d6',     damageType: 'Perfuração',        critical: '19/x3', range: 'Curto', weight: 1,   category: 'fogo',    properties: 'Leve, Recarregar ação padrão',                           price: 75  },
  'Pistola-Tambor':     { damage: '2d6',     damageType: 'Perfuração',        critical: '19/x3', range: 'Curto', weight: 1.5, category: 'fogo',    properties: 'Recarregar ação padrão',                                 price: 2100},
  'Arcabuz':            { damage: '2d8',     damageType: 'Perfuração',        critical: '19/x3', range: 'Médio', weight: 5,   category: 'fogo',    properties: 'Duas mãos, Recarregar ação padrão',                      price: 800 },
};

export const armorData: Record<string, ArmorRef> = {
  // Armaduras Leves
  'Armadura Acolchoada':  { defenseBonus: '+1',  penalty: '',   weight: 5,  type: 'leve',   price: 5    },
  'Armadura de Couro':    { defenseBonus: '+2',  penalty: '',   weight: 7,  type: 'leve',   price: 20   },
  'Couro Batido':         { defenseBonus: '+3',  penalty: '-1', weight: 10, type: 'leve',   price: 35   },
  'Gibão de Peles':       { defenseBonus: '+4',  penalty: '-3', weight: 12, type: 'leve',   price: 25   },
  'Couraça':              { defenseBonus: '+5',  penalty: '-4', weight: 15, type: 'leve',   price: 500  },
  // Armaduras Leves — Complemento
  'Armadura de Ossos':    { defenseBonus: '+3',  penalty: '-2', weight: 10, type: 'leve',   price: 120  },
  'Veste de Teia de Aranha': { defenseBonus: '+4', penalty: '', weight: 8,  type: 'leve',   price: 3000 },
  // Armaduras Pesadas
  'Brunea':               { defenseBonus: '+5',  penalty: '-2', weight: 15, type: 'pesada', price: 50   },
  'Cota de Malha':        { defenseBonus: '+6',  penalty: '-2', weight: 20, type: 'pesada', price: 150  },
  'Loriga Segmentada':    { defenseBonus: '+7',  penalty: '-3', weight: 17, type: 'pesada', price: 250  },
  'Meia Armadura':        { defenseBonus: '+8',  penalty: '-4', weight: 22, type: 'pesada', price: 600  },
  'Armadura Completa':    { defenseBonus: '+10', penalty: '-5', weight: 25, type: 'pesada', price: 3000 },
  // Armaduras Pesadas — Complemento
  'Armadura de Quitina':  { defenseBonus: '+7',  penalty: '-3', weight: 18, type: 'pesada', price: 350  },
  // Escudos
  'Escudo Leve':          { defenseBonus: '+1',  penalty: '-1', weight: 3,  type: 'escudo', price: 5    },
  'Escudo Pesado':        { defenseBonus: '+2',  penalty: '-2', weight: 7,  type: 'escudo', price: 15   },
};

export const generalItemData: Record<string, GeneralItemRef> = {
  'Água Benta':               { weight: 0.5,  description: '2d10 dano de luz vs. mortos-vivos/demônios/diabos (Ref CD Des ÷2)',    price: 10  },
  'Algemas':                  { weight: 1,    description: 'Escapar: Acrobacia CD 30 ou Força CD 26',                               price: 15  },
  'Algibeira':                { weight: 0.25, description: 'Bolsa de couro para itens pequenos e moedas',                           price: 1   },
  'Barraca':                  { weight: 10,   description: 'Abrigo para 2 pessoas; +2 em Sobrevivência para acampar',               price: 10  },
  'Corda (10m)':              { weight: 5,    description: 'Arrebentar: Força CD 23',                                               price: 1   },
  'Espelho de Metal':         { weight: 0.25,                                                                                        price: 10  },
  'Instrumento Musical':      { weight: 1.5,                                                                                         price: 50  },
  'Kit de Ofício':            { weight: 4,    description: 'Sem kit: –5 nos testes de Ofício',                                      price: 30  },
  'Kit de Disfarces':         { weight: 4,    description: 'Sem kit: –5 em Enganação para disfarces',                               price: 50  },
  'Kit de Ladrão':            { weight: 0.5,  description: 'Sem kit: –5 em Ladinagem para abrir fechaduras/sabotar',                price: 30  },
  'Kit de Medicamentos':      { weight: 2,    description: 'Sem kit: –5 em testes de Cura',                                         price: 50  },
  'Lampião':                  { weight: 1,    description: 'Ilumina 9m; 1 carga de óleo dura 6 horas',                              price: 7   },
  'Mochila':                  { weight: 1,                                                                                           price: 2   },
  'Odre':                     { weight: 2,    description: 'Para carregar líquidos (1 litro)',                                       price: 1   },
  'Pé de Cabra':              { weight: 2.5,  description: '+5 em Força para abrir portas/baús; pode ser usada como clava',         price: 2   },
  'Pederneira':               { weight: 0,                                                                                           price: 1   },
  'Ração de Viagem (por dia)': { weight: 0.5,                                                                                        price: 0.5 },
  'Saco de Dormir':           { weight: 2.5,                                                                                         price: 1   },
  'Saco de Lona':             { weight: 0.25,                                                                                        price: 0.1 },
  'Tocha':                    { weight: 0.5,  description: 'Ilumina 6m por 1 hora; arma leve 1d4+1 fogo',                           price: 0.1 },
  'Vara de Madeira (3m)':     { weight: 4,                                                                                           price: 0.2 },
  'Ácido':                    { weight: 0.5,  description: '2d4 dano ácido em alcance curto (Ref CD Des ÷2)',                       price: 10  },
  'Bálsamo Restaurador':      { weight: 0.5,  description: 'Ação completa: recupera 2d4 PV',                                        price: 10  },
  'Bomba':                    { weight: 0.5,  description: '6d6 dano impacto em raio 3m; alcance curto (Ref CD Des ÷2)',             price: 50  },
  'Essência de Mana':         { weight: 0.1,  description: 'Ação padrão: recupera 1d4 PM',                                          price: 50  },
  'Fogo Alquímico':           { weight: 0.5,  description: '1d6 dano fogo + em chamas em alcance curto (Ref CD Des evita chamas)',  price: 10  },
};
