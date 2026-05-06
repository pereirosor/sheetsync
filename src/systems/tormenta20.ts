import type { GameSystem, Character, Campaign } from '../types';

const calcMod = (val: number) => Math.floor((val - 10) / 2);

const tormenta20: GameSystem = {
  systemId: 'tormenta20',
  name: 'Tormenta 20',
  classList: [
    'Arcanista', 'Bárbaro', 'Bardo', 'Bucaneiro', 'Caçador', 'Cavaleiro',
    'Clérigo', 'Druida', 'Guerreiro', 'Inventor', 'Ladino', 'Lutador', 'Nobre', 'Paladino',
  ],
  originData: {
    'Acólito':                   ['Cura', 'Religião', 'Vontade', 'Medicina', 'Membro da Igreja', 'Vontade de Ferro'],
    'Amigo dos Animais':         ['Adestramento', 'Cavalgar', 'Amigo Especial'],
    'Amnésico':                  ['Lembranças Graduais'],
    'Aristocrata':               ['Diplomacia', 'Enganação', 'Nobreza', 'Comandar', 'Sangue Azul'],
    'Artesão':                   ['Ofício', 'Vontade', 'Frutos do Trabalho', 'Sortudo'],
    'Artista':                   ['Atuação', 'Enganação', 'Atraente', 'Dom Artístico', 'Sortudo', 'Torcida'],
    'Assistente de Laboratório': ['Ofício (alquimia)', 'Misticismo', 'Esse Cheiro...', 'Venefício', 'Poder da Tormenta (à escolha)'],
    'Batedor':                   ['Furtividade', 'Percepção', 'Sobrevivência', 'À Prova de Tudo', 'Estilo de Disparo', 'Sentidos Aguçados'],
    'Capanga':                   ['Luta', 'Intimidação', 'Confissão', 'Poder de combate (à escolha)'],
    'Charlatão':                 ['Enganação', 'Jogatina', 'Alpinista Social', 'Aparência Inofensiva', 'Sortudo'],
    'Circense':                  ['Acrobacia', 'Atuação', 'Reflexos', 'Acrobático', 'Torcida', 'Truque de Mágica'],
    'Criminoso':                 ['Enganação', 'Furtividade', 'Ladinagem', 'Punguista', 'Venefício'],
    'Curandeiro':                ['Cura', 'Vontade', 'Medicina', 'Médico de Campo', 'Venefício'],
    'Eremita':                   ['Misticismo', 'Religião', 'Sobrevivência', 'Busca Interior', 'Lobo Solitário'],
    'Escravo':                   ['Atletismo', 'Fortitude', 'Furtividade', 'Desejo de Liberdade', 'Vitalidade'],
    'Estudioso':                 ['Conhecimento', 'Guerra', 'Misticismo', 'Aparência Inofensiva', 'Palpite Fundamentado'],
    'Fazendeiro':                ['Adestramento', 'Cavalgar', 'Ofício (fazendeiro)', 'Sobrevivência', 'Água no Feijão', 'Ginete'],
    'Forasteiro':                ['Cavalgar', 'Pilotagem', 'Sobrevivência', 'Cultura Exótica', 'Lobo Solitário'],
    'Gladiador':                 ['Atuação', 'Luta', 'Atraente', 'Pão e Circo', 'Torcida', 'Poder de combate (à escolha)'],
    'Guarda':                    ['Investigação', 'Luta', 'Percepção', 'Detetive', 'Investigador', 'Poder de combate (à escolha)'],
    'Herdeiro':                  ['Misticismo', 'Nobreza', 'Ofício', 'Comandar', 'Herança'],
    'Herói Camponês':            ['Adestramento', 'Ofício', 'Amigo dos Plebeus', 'Sortudo', 'Surto Heroico', 'Torcida'],
    'Marujo':                    ['Atletismo', 'Jogatina', 'Pilotagem', 'Acrobático', 'Passagem de Navio'],
    'Mateiro':                   ['Atletismo', 'Furtividade', 'Sobrevivência', 'Lobo Solitário', 'Sentidos Aguçados', 'Vendedor de Carcaças'],
    'Membro de Guilda':          ['Diplomacia', 'Enganação', 'Misticismo', 'Ofício', 'Foco em Perícia', 'Rede de Contatos'],
    'Mercador':                  ['Diplomacia', 'Intuição', 'Ofício', 'Negociação', 'Proficiência', 'Sortudo'],
    'Minerador':                 ['Atletismo', 'Fortitude', 'Ofício (minerador)', 'Ataque Poderoso', 'Escavador', 'Sentidos Aguçados'],
    'Nômade':                    ['Cavalgar', 'Pilotagem', 'Sobrevivência', 'Lobo Solitário', 'Mochileiro', 'Sentidos Aguçados'],
    'Pivete':                    ['Furtividade', 'Iniciativa', 'Ladinagem', 'Acrobático', 'Aparência Inofensiva', 'Quebra-Galho'],
    'Refugiado':                 ['Fortitude', 'Reflexos', 'Vontade', 'Estoico', 'Vontade de Ferro'],
    'Seguidor':                  ['Adestramento', 'Ofício', 'Antigo Mestre', 'Proficiência', 'Surto Heroico'],
    'Selvagem':                  ['Percepção', 'Reflexos', 'Sobrevivência', 'Lobo Solitário', 'Vida Rústica', 'Vitalidade'],
    'Soldado':                   ['Fortitude', 'Guerra', 'Luta', 'Pontaria', 'Influência Militar', 'Poder de combate (à escolha)'],
    'Taverneiro':                ['Diplomacia', 'Jogatina', 'Ofício (culinária)', 'Gororoba', 'Proficiência', 'Vitalidade'],
    'Trabalhador':               ['Atletismo', 'Fortitude', 'Atlético', 'Esforçado'],
  },
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
      trainedSkills: ['misticismo', 'vontade'],
      skillChoices: [
        { count: 1, options: ['conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'iniciativa', 'oficio', 'percepcao'] },
      ],
      abilities: [
        { level: 1, name: 'Caminho do Arcanista', description: 'Escolha um caminho arcano (Mago, Ilusionista, Necromante etc.) que define seus poderes exclusivos.' },
        { level: 1, name: 'Magias (1º círculo)', description: 'Você pode lançar magias arcanas de 1º círculo. Acessa círculos maiores a cada dois níveis.' },
        { level: 20, name: 'Arcanista Supremo', description: 'Gaste 5 PM para lançar uma magia arcana sem pagar seu custo normal.' },
      ],
    },
    'Bárbaro': {
      hpBase: 24, hpPerLevel: 6, mpPerLevel: 3,
      proficiencies: 'Armas marciais, escudos',
      level1Abilities: ['Fúria +2'],
      trainedSkills: ['fortitude', 'luta'],
      skillChoices: [
        { count: 4, options: ['adestramento', 'atletismo', 'cavalgar', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'sobrevivencia', 'vontade'] },
      ],
      abilities: [
        { level: 1, name: 'Fúria +2', description: 'Gaste 2 PM: receba +4 em ataques e dano, +ConMod PV temporários, mas sofra –5 na Defesa e não possa lançar magias. Aumenta a cada 6 níveis.' },
        { level: 3, name: 'Mente de Batalha', description: 'Enquanto em Fúria, você é imune a efeitos mentais (medo, encantamento etc.).' },
        { level: 5, name: 'Fúria +4', description: 'Bônus de ataque e dano em Fúria aumenta para +8.' },
        { level: 11, name: 'Fúria +6', description: 'Bônus de ataque e dano em Fúria aumenta para +12.' },
        { level: 17, name: 'Fúria +8', description: 'Bônus de ataque e dano em Fúria aumenta para +16.' },
        { level: 20, name: 'Bárbaro Imortal', description: 'Quando reduziria a 0 PV, pode gastar 5 PM para ficar com 1 PV. Uma vez por cena.' },
      ],
    },
    'Bardo': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Armas marciais',
      level1Abilities: ['Inspiração +1', 'Magias (1º círculo)'],
      trainedSkills: ['atuacao', 'reflexos'],
      skillChoices: [
        { count: 6, options: ['acrobacia', 'cavalgar', 'conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'diplomacia', 'enganacao', 'furtividade', 'iniciativa', 'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo', 'nobreza', 'percepcao', 'pontaria', 'religiao', 'vontade'] },
      ],
      abilities: [
        { level: 1, name: 'Inspiração +1', description: 'Gaste 1 PM: um aliado em alcance curto recebe +1 em qualquer teste até o fim da cena.' },
        { level: 1, name: 'Magias (1º círculo)', description: 'Você pode lançar magias arcanas de 1º círculo.' },
        { level: 5, name: 'Inspiração +2', description: 'Bônus de Inspiração aumenta para +2.' },
        { level: 11, name: 'Inspiração +3', description: 'Bônus de Inspiração aumenta para +3.' },
        { level: 17, name: 'Inspiração +4', description: 'Bônus de Inspiração aumenta para +4.' },
        { level: 20, name: 'Obra-Prima', description: 'Uma vez por dia, você pode lançar qualquer magia arcana que conheça sem custo em PM.' },
      ],
    },
    'Bucaneiro': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 3,
      proficiencies: 'Armas marciais',
      level1Abilities: ['Audácia', 'Insolência'],
      trainedSkills: ['reflexos'],
      skillChoices: [
        { count: 1, options: ['luta', 'pontaria'] },
        { count: 4, options: ['acrobacia', 'atletismo', 'atuacao', 'enganacao', 'fortitude', 'furtividade', 'iniciativa', 'intimidacao', 'jogatina', 'oficio', 'percepcao', 'pilotagem'] },
      ],
      abilities: [
        { level: 1, name: 'Audácia', description: 'Some seu bônus de CAR na Iniciativa. Sem armadura ou escudo pesado, some também na Defesa.' },
        { level: 1, name: 'Insolência', description: 'Gaste 1 PM: realize uma ação de movimento adicional no turno. Uma vez por rodada.' },
        { level: 6, name: 'Sortudo', description: 'Uma vez por cena, role novamente qualquer dado recém rolado e use o melhor resultado.' },
        { level: 11, name: 'Finta Aprimorada', description: 'Finta custa uma ação de movimento em vez de ação padrão.' },
        { level: 20, name: 'Pirata Lendário', description: 'Quando usa Audácia para adicionar CAR na Defesa, adiciona o dobro do modificador.' },
      ],
    },
    'Caçador': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Armas marciais, escudos',
      level1Abilities: ['Marca da Presa +1d4', 'Rastreador'],
      trainedSkills: ['sobrevivencia'],
      skillChoices: [
        { count: 1, options: ['luta', 'pontaria'] },
        { count: 6, options: ['adestramento', 'atletismo', 'cavalgar', 'cura', 'fortitude', 'furtividade', 'iniciativa', 'investigacao', 'oficio', 'percepcao', 'reflexos'] },
      ],
      abilities: [
        { level: 1, name: 'Marca da Presa +1d4', description: 'Gaste 1 PM: marque uma criatura. Seus ataques contra ela causam +1d4 de dano extra. A marca dura a cena.' },
        { level: 1, name: 'Rastreador', description: 'Você se move a velocidade normal ao rastrear e pode rastrear à noite sem penalidade.' },
        { level: 5, name: 'Marca da Presa +2d4', description: 'Dano de Marca da Presa aumenta para +2d4.' },
        { level: 9, name: 'Marca da Presa +3d4', description: 'Dano de Marca da Presa aumenta para +3d4.' },
        { level: 13, name: 'Marca da Presa +4d4', description: 'Dano de Marca da Presa aumenta para +4d4.' },
        { level: 17, name: 'Marca da Presa +5d4', description: 'Dano de Marca da Presa aumenta para +5d4.' },
        { level: 20, name: 'Presa Definitiva', description: 'Ao marcar uma presa, gaste 5 PM para ela não poder se tornar imune à marca e para dobrar o dano extra.' },
      ],
    },
    'Cavaleiro': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Baluarte +2', 'Código de Honra'],
      trainedSkills: ['fortitude', 'luta'],
      skillChoices: [
        { count: 2, options: ['adestramento', 'atletismo', 'cavalgar', 'diplomacia', 'guerra', 'iniciativa', 'intimidacao', 'nobreza', 'percepcao', 'vontade'] },
      ],
      abilities: [
        { level: 1, name: 'Código de Honra', description: 'Você nunca pode atacar um alvo indefeso nem abandonar um aliado em perigo.' },
        { level: 1, name: 'Baluarte +2', description: 'Gaste 1 PM: você (e aliados adjacentes a partir do 7º nível) recebem +2 na Defesa e em testes de resistência contra efeitos sobrenaturais.' },
        { level: 2, name: 'Duelo', description: 'Gaste 2 PM: desafie um inimigo. Vocês dois recebem +1 em ataques e dano mútuos até o fim da cena.' },
        { level: 5, name: 'Caminho', description: 'Escolha entre Bastião (RD 5 quando de armadura pesada) ou Montaria (invoque uma montaria de batalha).' },
        { level: 11, name: 'Resoluto', description: 'Gaste 1 PM para rolar novamente um teste de resistência recém realizado.' },
        { level: 20, name: 'Bravura Final', description: 'Ao chegar a 0 PV, pode gastar 5 PM por turno para permanecer consciente e continuar agindo.' },
      ],
    },
    'Clérigo': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 5,
      proficiencies: 'Armaduras pesadas, escudos',
      level1Abilities: ['Devoto', 'Magias (1º círculo)'],
      trainedSkills: ['religiao', 'vontade'],
      skillChoices: [
        { count: 2, options: ['conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'intuicao', 'luta', 'misticismo', 'nobreza', 'oficio', 'percepcao'] },
      ],
      abilities: [
        { level: 1, name: 'Devoto', description: 'Você serve a uma divindade, seguindo suas obrigações e restrições em troca de Poderes Concedidos.' },
        { level: 1, name: 'Magias (1º círculo)', description: 'Você lança magias divinas de 1º círculo. Acessa círculos maiores a cada dois níveis.' },
        { level: 20, name: 'Mão da Divindade', description: 'Gaste 15 PM para lançar três magias divinas como ações livres no mesmo turno.' },
      ],
    },
    'Druida': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Escudos',
      level1Abilities: ['Devoto', 'Empatia Selvagem', 'Magias (1º círculo)'],
      trainedSkills: ['sobrevivencia', 'vontade'],
      skillChoices: [
        { count: 4, options: ['adestramento', 'atletismo', 'cavalgar', 'conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'cura', 'fortitude', 'iniciativa', 'intuicao', 'luta', 'misticismo', 'oficio', 'percepcao', 'religiao'] },
      ],
      abilities: [
        { level: 1, name: 'Devoto', description: 'Você serve a uma divindade da natureza (geralmente Allihanna), seguindo suas obrigações em troca de Poderes Concedidos.' },
        { level: 1, name: 'Empatia Selvagem', description: 'Você pode se comunicar com animais. Com um teste de Adestramento, pode calmá-los ou pedir ajuda simples.' },
        { level: 1, name: 'Magias (1º círculo)', description: 'Você lança magias divinas de 1º círculo.' },
        { level: 2, name: 'Caminho dos Ermos', description: 'Você se move normalmente por terreno difícil natural e a CD para rastrear você aumenta em +10.' },
        { level: 20, name: 'Força da Natureza', description: 'Todas as suas magias custam –2 PM e têm CD +2. Em terreno natural, esses bônus dobram.' },
      ],
    },
    'Guerreiro': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Ataque Especial +4'],
      trainedSkills: ['fortitude'],
      skillChoices: [
        { count: 1, options: ['luta', 'pontaria'] },
        { count: 2, options: ['adestramento', 'atletismo', 'cavalgar', 'guerra', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'reflexos'] },
      ],
      abilities: [
        { level: 1, name: 'Ataque Especial +4', description: 'Gaste 1 PM: receba +4 em testes de ataque ou rolagens de dano (escolha antes de rolar). A cada 4 níveis, gaste +1 PM para +4 adicionais.' },
        { level: 3, name: 'Durão', description: 'Gaste 2 PM quando sofrer dano: reduza o dano à metade.' },
        { level: 6, name: 'Ataque Extra', description: 'Gaste 2 PM ao usar a ação atacar para realizar um ataque adicional com a mesma arma.' },
        { level: 20, name: 'Campeão', description: 'Dano de todos os seus ataques aumenta um passo. Acertando um Ataque Especial ou Golpe Pessoal, recupera metade dos PM gastos.' },
      ],
    },
    'Inventor': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Engenhosidade', 'Protótipo'],
      trainedSkills: ['oficio', 'vontade'],
      skillChoices: [
        { count: 4, options: ['conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'cura', 'diplomacia', 'fortitude', 'iniciativa', 'investigacao', 'luta', 'misticismo', 'percepcao', 'pilotagem', 'pontaria'] },
      ],
      abilities: [
        { level: 1, name: 'Engenhosidade', description: 'Gaste 2 PM ao fazer um teste de perícia: receba bônus igual ao modificador de INT. Não funciona em testes de ataque.' },
        { level: 1, name: 'Protótipo', description: 'Você começa com um item superior com uma modificação ou 10 itens alquímicos (até T$ 500).' },
        { level: 2, name: 'Fabricar Item Superior (1 mod)', description: 'Você pode fabricar itens superiores com uma modificação.' },
        { level: 3, name: 'Comerciante', description: 'Você vende itens 10% mais caro (não cumulativo com Barganha).' },
        { level: 7, name: 'Encontrar Fraqueza', description: 'Gaste 2 PM + ação de movimento: ignore a RD de um objeto ou receba +2 em ataques contra alvo de armadura ou construto.' },
        { level: 9, name: 'Fabricar Item Mágico (menor)', description: 'Você recebe e pode fabricar itens mágicos menores.' },
        { level: 11, name: 'Olho do Dragão', description: 'Gaste uma ação completa para analisar um item e descobrir automaticamente se é mágico e suas propriedades.' },
        { level: 13, name: 'Fabricar Item Mágico (médio)', description: 'Você pode fabricar itens mágicos médios.' },
        { level: 17, name: 'Fabricar Item Mágico (maior)', description: 'Você pode fabricar itens mágicos maiores.' },
        { level: 20, name: 'Obra-Prima', description: 'Você cria um item lendário único, aprovado pelo mestre, equivalente a item superior (6 mods) + item mágico maior.' },
      ],
    },
    'Ladino': {
      hpBase: 12, hpPerLevel: 3, mpPerLevel: 4,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Ataque Furtivo +1d6', 'Especialista'],
      trainedSkills: ['ladinagem', 'reflexos'],
      skillChoices: [
        { count: 8, options: ['acrobacia', 'atletismo', 'atuacao', 'cavalgar', 'conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'diplomacia', 'enganacao', 'furtividade', 'iniciativa', 'intimidacao', 'intuicao', 'investigacao', 'jogatina', 'luta', 'oficio', 'percepcao', 'pilotagem', 'pontaria'] },
      ],
      abilities: [
        { level: 1, name: 'Ataque Furtivo +1d6', description: 'Uma vez por rodada, quando atinge um alvo desprevenido ou flanqueado, cause +1d6 de dano extra. Aumenta +1d6 a cada dois níveis.' },
        { level: 1, name: 'Especialista', description: 'Escolha perícias treinadas (igual ao bônus de INT): ao usá-las, gaste 1 PM para dobrar o bônus de treinamento.' },
        { level: 2, name: 'Evasão', description: 'Em ataques que permitam Reflexos para reduzir dano à metade: se passar, não sofre dano algum.' },
        { level: 4, name: 'Esquiva Sobrenatural', description: 'Seus instintos estão tão aguçados que você nunca fica surpreendido.' },
        { level: 8, name: 'Olhos nas Costas', description: 'Você não pode ser flanqueado.' },
        { level: 10, name: 'Evasão Aprimorada', description: 'Em ataques com Reflexos: sem dano se passar, metade do dano se falhar.' },
        { level: 20, name: 'A Pessoa Certa para o Trabalho', description: 'Gaste 5 PM ao fazer um ataque furtivo ou usar uma perícia de ladino: receba +10 no teste.' },
      ],
    },
    'Lutador': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Nenhuma',
      level1Abilities: ['Briga (1d6)', 'Golpe Relâmpago'],
      trainedSkills: ['fortitude', 'luta'],
      skillChoices: [
        { count: 4, options: ['acrobacia', 'adestramento', 'atletismo', 'enganacao', 'furtividade', 'iniciativa', 'intimidacao', 'oficio', 'percepcao', 'pontaria', 'reflexos'] },
      ],
      abilities: [
        { level: 1, name: 'Briga (1d6)', description: 'Seus ataques desarmados causam 1d6 de dano e podem ser letais ou não letais sem penalidade.' },
        { level: 1, name: 'Golpe Relâmpago', description: 'Ao usar a ação atacar desarmado, gaste 1 PM para realizar um ataque desarmado adicional.' },
        { level: 3, name: 'Casca Grossa', description: 'Some seu bônus de CON na Defesa (limitado pelo nível) sem armadura pesada. A cada 4 níveis, recebe +1 na Defesa.' },
        { level: 5, name: 'Briga (1d8) + Golpe Cruel', description: 'Dano desarmado aumenta para 1d8. Margem de ameaça com ataques desarmados aumenta em +1.' },
        { level: 9, name: 'Briga (1d10) + Golpe Violento', description: 'Dano desarmado aumenta para 1d10. Multiplicador de crítico com ataques desarmados aumenta em +1.' },
        { level: 13, name: 'Briga (2d6)', description: 'Dano desarmado aumenta para 2d6.' },
        { level: 17, name: 'Briga (2d8)', description: 'Dano desarmado aumenta para 2d8.' },
        { level: 20, name: 'Dono da Rua (2d10)', description: 'Dano desarmado aumenta para 2d10. Ao atacar desarmado, você pode fazer dois ataques em vez de um (Golpe Relâmpago adiciona um terceiro).' },
      ],
    },
    'Nobre': {
      hpBase: 16, hpPerLevel: 4, mpPerLevel: 4,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Autoconfiança', 'Espólio', 'Orgulho'],
      trainedSkills: ['vontade'],
      skillChoices: [
        { count: 1, options: ['diplomacia', 'intimidacao'] },
        { count: 4, options: ['adestramento', 'atuacao', 'cavalgar', 'conhecimento_arcano', 'conhecimento_natureza', 'conhecimento_dungeons', 'conhecimento_plano', 'conhecimento_nobre', 'conhecimento_religioso', 'enganacao', 'fortitude', 'guerra', 'iniciativa', 'intuicao', 'investigacao', 'jogatina', 'luta', 'nobreza', 'oficio', 'percepcao', 'pontaria'] },
      ],
      abilities: [
        { level: 1, name: 'Autoconfiança', description: 'Some seu bônus de CAR em vez de DES na Defesa (exceto de armadura pesada).' },
        { level: 1, name: 'Espólio', description: 'Você recebe um item a sua escolha com preço de até T$ 2.000.' },
        { level: 1, name: 'Orgulho', description: 'Ao fazer um teste de perícia, gaste PM (limitado pelo bônus de CAR): receba +2 por PM gasto no teste.' },
        { level: 2, name: 'Riqueza', description: 'Uma vez por aventura, faça um teste de CAR + nível de nobre para receber esse valor em Tibares de ouro.' },
        { level: 3, name: 'Gritar Ordens', description: 'Gaste PM (limitado pelo bônus de CAR): aliados em alcance curto recebem bônus igual aos PM gastos em todos os testes de perícia até seu próximo turno.' },
        { level: 20, name: 'Realeza', description: 'Criaturas que falhem em 10+ no teste de Presença Aristocrática passam a lutar ao seu lado. Alvos reduzidos a 0 PV por Palavras Afiadas também se rendem.' },
      ],
    },
    'Paladino': {
      hpBase: 20, hpPerLevel: 5, mpPerLevel: 3,
      proficiencies: 'Armas marciais, armaduras pesadas, escudos',
      level1Abilities: ['Abençoado', 'Código do Herói', 'Golpe Divino (+1d8)'],
      trainedSkills: ['luta', 'vontade'],
      skillChoices: [
        { count: 2, options: ['adestramento', 'atletismo', 'cavalgar', 'cura', 'diplomacia', 'fortitude', 'guerra', 'iniciativa', 'intuicao', 'nobreza', 'percepcao', 'religiao'] },
      ],
      abilities: [
        { level: 1, name: 'Abençoado', description: 'Some seu bônus de CAR ao total de PM. Torne-se devoto de uma divindade bondosa e ganhe seus Poderes Concedidos.' },
        { level: 1, name: 'Código do Herói', description: 'Sempre mantenha sua palavra, nunca recuse ajuda a inocentes e jamais minta, trapaceie ou roube. Violar o código remove todos os seus PM até o dia seguinte.' },
        { level: 1, name: 'Golpe Divino (+1d8)', description: 'Gaste 2 PM ao atacar corpo a corpo: some CAR no teste de ataque e +1d8 no dano. A cada 4 níveis, gaste +1 PM para +1d8 extra.' },
        { level: 2, name: 'Cura pelas Mãos (1d8+1)', description: 'Gaste 1 PM + ação de movimento: cure 1d8+1 PV de um alvo em alcance corpo a corpo. Escala a cada 4 níveis.' },
        { level: 3, name: 'Aura Sagrada', description: 'Gaste 1 PM para ativar uma aura (alcance curto) que ilumina como tocha e dá aos aliados bônus de CAR em testes de resistência. Custo: 1 PM/turno.' },
        { level: 5, name: 'Bênção da Justiça', description: 'Escolha Égide Sagrada (bônus de CAR na Defesa para aliados adjacentes) ou Montaria Sagrada (invocar montaria divina).' },
        { level: 9, name: 'Golpe Divino (+3d8)', description: 'Golpe Divino pode causar até +3d8 de dano (gaste 2+2 PM).' },
        { level: 13, name: 'Golpe Divino (+4d8)', description: 'Golpe Divino pode causar até +4d8 de dano.' },
        { level: 17, name: 'Golpe Divino (+5d8)', description: 'Golpe Divino pode causar até +5d8 de dano.' },
        { level: 20, name: 'Vingador Sagrado', description: 'Gaste 10 PM + ação completa: voo 18m, RD 20 e some CAR em ataques e dano corpo a corpo até o fim da cena.' },
      ],
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
