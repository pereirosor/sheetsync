export interface CoCSkillDef {
  id: string;
  name: string;
  baseValue: number;
  specialization?: string;
  isDynamic?: boolean;
  dynamicFormula?: 'dex/2' | 'edu';
  era?: ('1920s' | 'modern' | 'any')[];
  canPush?: boolean; // false = never push (Mitologia de Cthulhu, Esquivar)
}

export function calcSkillBase(
  skill: CoCSkillDef,
  dexterity: number,
  education: number,
): number {
  if (!skill.isDynamic) return skill.baseValue;
  if (skill.dynamicFormula === 'dex/2') return Math.floor(dexterity / 2);
  if (skill.dynamicFormula === 'edu') return education;
  return skill.baseValue;
}

export function getSkillDisplayName(skill: CoCSkillDef): string {
  return skill.specialization ? `${skill.name} (${skill.specialization})` : skill.name;
}

export function getSkillsForEra(era: '1920s' | 'modern'): CoCSkillDef[] {
  return COC_SKILLS.filter(s => {
    if (!s.era) return true;
    return s.era.includes('any') || s.era.includes(era);
  });
}

export function getSkillById(id: string): CoCSkillDef | undefined {
  return COC_SKILLS.find(s => s.id === id);
}

export const COC_SKILLS: CoCSkillDef[] = [
  // ── Dynamic ──────────────────────────────────────────────────────────────
  { id: 'esquivar',      name: 'Esquivar',      baseValue: 0, isDynamic: true, dynamicFormula: 'dex/2', era: ['any'], canPush: false },
  { id: 'lingua-nativa', name: 'Língua Nativa',  baseValue: 0, isDynamic: true, dynamicFormula: 'edu',   era: ['any'] },

  // ── Combate — Lutar ───────────────────────────────────────────────────────
  { id: 'lutar-briga',   name: 'Lutar', specialization: 'Briga',   baseValue: 25, era: ['any'] },
  { id: 'lutar-faca',    name: 'Lutar', specialization: 'Faca',    baseValue: 25, era: ['any'] },
  { id: 'lutar-espada',  name: 'Lutar', specialization: 'Espada',  baseValue: 20, era: ['any'] },
  { id: 'lutar-lanca',   name: 'Lutar', specialization: 'Lança',   baseValue: 20, era: ['any'] },
  { id: 'lutar-machado', name: 'Lutar', specialization: 'Machado', baseValue: 15, era: ['any'] },
  { id: 'lutar-chicote', name: 'Lutar', specialization: 'Chicote', baseValue: 5,  era: ['any'] },

  // ── Combate — Armas de Fogo ───────────────────────────────────────────────
  { id: 'arma-fogo-pistola',    name: 'Armas de Fogo', specialization: 'Pistola',           baseValue: 20, era: ['any'] },
  { id: 'arma-fogo-rifle',      name: 'Armas de Fogo', specialization: 'Rifle/Espingarda',   baseValue: 25, era: ['any'] },
  { id: 'arma-fogo-automatica', name: 'Armas de Fogo', specialization: 'Automáticas',        baseValue: 15, era: ['any'] },
  { id: 'arma-fogo-pesada',     name: 'Armas de Fogo', specialization: 'Armas Pesadas',      baseValue: 10, era: ['any'] },
  { id: 'arma-fogo-arco',       name: 'Armas de Fogo', specialization: 'Arco',               baseValue: 15, era: ['1920s'] },
  { id: 'arremessar',           name: 'Arremessar',                                           baseValue: 20, era: ['any'] },

  // ── Interpessoal ─────────────────────────────────────────────────────────
  { id: 'charme',      name: 'Charme',      baseValue: 15, era: ['any'] },
  { id: 'intimidacao', name: 'Intimidação', baseValue: 15, era: ['any'] },
  { id: 'labia',       name: 'Lábia',       baseValue: 5,  era: ['any'] },
  { id: 'persuadir',   name: 'Persuadir',   baseValue: 10, era: ['any'] },

  // ── Percepção & Investigação ──────────────────────────────────────────────
  { id: 'percepcao',       name: 'Percepção',       baseValue: 25, era: ['any'] },
  { id: 'escuta',          name: 'Escuta',           baseValue: 20, era: ['any'] },
  { id: 'pista',           name: 'Pista',            baseValue: 20, era: ['any'] },
  { id: 'rastrear',        name: 'Rastrear',         baseValue: 10, era: ['any'] },
  { id: 'psicologia',      name: 'Psicologia',       baseValue: 10, era: ['any'] },
  { id: 'usar-biblioteca', name: 'Usar Biblioteca',  baseValue: 20, era: ['any'] },

  // ── Acadêmico ─────────────────────────────────────────────────────────────
  { id: 'arqueologia',   name: 'Arqueologia',   baseValue: 1,  era: ['any'] },
  { id: 'antropologia',  name: 'Antropologia',  baseValue: 1,  era: ['any'] },
  { id: 'astronomia',    name: 'Astronomia',    baseValue: 1,  era: ['any'] },
  { id: 'contabilidade', name: 'Contabilidade', baseValue: 5,  era: ['any'] },
  { id: 'direito',       name: 'Direito',       baseValue: 5,  era: ['any'] },
  { id: 'historia',      name: 'História',      baseValue: 5,  era: ['any'] },
  { id: 'medicina',      name: 'Medicina',      baseValue: 1,  era: ['any'] },
  { id: 'mundo-natural', name: 'Mundo Natural', baseValue: 10, era: ['any'] },
  { id: 'ocultismo',     name: 'Ocultismo',     baseValue: 5,  era: ['any'] },
  { id: 'psicanalise',   name: 'Psicanálise',   baseValue: 1,  era: ['any'] },

  // ── Ciência (especializações) ─────────────────────────────────────────────
  { id: 'ciencia-biologia',     name: 'Ciência', specialization: 'Biologia',     baseValue: 1, era: ['any'] },
  { id: 'ciencia-botanica',     name: 'Ciência', specialization: 'Botânica',     baseValue: 1, era: ['any'] },
  { id: 'ciencia-engenharia',   name: 'Ciência', specialization: 'Engenharia',   baseValue: 1, era: ['any'] },
  { id: 'ciencia-fisica',       name: 'Ciência', specialization: 'Física',       baseValue: 1, era: ['any'] },
  { id: 'ciencia-geologia',     name: 'Ciência', specialization: 'Geologia',     baseValue: 1, era: ['any'] },
  { id: 'ciencia-matematica',   name: 'Ciência', specialization: 'Matemática',   baseValue: 1, era: ['any'] },
  { id: 'ciencia-meteorologia', name: 'Ciência', specialization: 'Meteorologia', baseValue: 1, era: ['any'] },
  { id: 'ciencia-quimica',      name: 'Ciência', specialization: 'Química',      baseValue: 1, era: ['any'] },
  { id: 'ciencia-zoologia',     name: 'Ciência', specialization: 'Zoologia',     baseValue: 1, era: ['any'] },

  // ── Arte e Ofício (especializações) ──────────────────────────────────────
  { id: 'arte-ator',     name: 'Arte e Ofício', specialization: 'Ator',         baseValue: 5, era: ['any'] },
  { id: 'arte-danca',    name: 'Arte e Ofício', specialization: 'Dança',        baseValue: 5, era: ['any'] },
  { id: 'arte-fotografia', name: 'Arte e Ofício', specialization: 'Fotografia', baseValue: 5, era: ['any'] },
  { id: 'arte-musica',   name: 'Arte e Ofício', specialization: 'Música',       baseValue: 5, era: ['any'] },
  { id: 'arte-pintura',  name: 'Arte e Ofício', specialization: 'Pintura',      baseValue: 5, era: ['any'] },
  { id: 'arte-escrita',  name: 'Arte e Ofício', specialization: 'Escrita',      baseValue: 5, era: ['any'] },
  { id: 'arte-escultura', name: 'Arte e Ofício', specialization: 'Escultura',   baseValue: 5, era: ['any'] },
  { id: 'arte-canto',    name: 'Arte e Ofício', specialization: 'Canto',        baseValue: 5, era: ['any'] },
  { id: 'arte-carpintaria', name: 'Arte e Ofício', specialization: 'Carpintaria', baseValue: 5, era: ['any'] },

  // ── Idioma (especializações) ──────────────────────────────────────────────
  { id: 'idioma-frances',  name: 'Idioma', specialization: 'Francês',   baseValue: 1, era: ['any'] },
  { id: 'idioma-alemao',   name: 'Idioma', specialization: 'Alemão',    baseValue: 1, era: ['any'] },
  { id: 'idioma-espanhol', name: 'Idioma', specialization: 'Espanhol',  baseValue: 1, era: ['any'] },
  { id: 'idioma-ingles',   name: 'Idioma', specialization: 'Inglês',    baseValue: 1, era: ['any'] },
  { id: 'idioma-latim',    name: 'Idioma', specialization: 'Latim',     baseValue: 1, era: ['any'] },
  { id: 'idioma-aramaico', name: 'Idioma', specialization: 'Aramaico',  baseValue: 1, era: ['any'] },
  { id: 'idioma-arabe',    name: 'Idioma', specialization: 'Árabe',     baseValue: 1, era: ['any'] },
  { id: 'idioma-chines',   name: 'Idioma', specialization: 'Chinês',    baseValue: 1, era: ['any'] },
  { id: 'idioma-japones',  name: 'Idioma', specialization: 'Japonês',   baseValue: 1, era: ['any'] },
  { id: 'idioma-russo',    name: 'Idioma', specialization: 'Russo',     baseValue: 1, era: ['any'] },
  { id: 'idioma-grego',    name: 'Idioma', specialization: 'Grego',     baseValue: 1, era: ['any'] },

  // ── Físico ────────────────────────────────────────────────────────────────
  { id: 'escalada',    name: 'Escalada',    baseValue: 20, era: ['any'] },
  { id: 'furtividade', name: 'Furtividade', baseValue: 20, era: ['any'] },
  { id: 'natacao',     name: 'Natação',     baseValue: 20, era: ['any'] },
  { id: 'saltar',      name: 'Saltar',      baseValue: 20, era: ['any'] },

  // ── Técnico ───────────────────────────────────────────────────────────────
  { id: 'abrir-fechaduras',    name: 'Abrir Fechaduras',         baseValue: 1,  era: ['any'] },
  { id: 'avaliar',             name: 'Avaliar',                  baseValue: 5,  era: ['any'] },
  { id: 'conserto-eletrico',   name: 'Conserto Elétrico',        baseValue: 10, era: ['any'] },
  { id: 'conserto-mecanico',   name: 'Conserto Mecânico',        baseValue: 10, era: ['any'] },
  { id: 'demolição',           name: 'Demolição',                baseValue: 1,  era: ['any'] },
  { id: 'disfarce',            name: 'Disfarce',                 baseValue: 5,  era: ['any'] },
  { id: 'mergulho',            name: 'Mergulho',                 baseValue: 1,  era: ['any'] },
  { id: 'navegar',             name: 'Navegar',                  baseValue: 10, era: ['any'] },
  { id: 'operar-maquinaria',   name: 'Operar Maquinaria Pesada', baseValue: 1,  era: ['any'] },
  { id: 'prestidigitacao',     name: 'Prestidigitação',          baseValue: 10, era: ['any'] },
  { id: 'primeiros-socorros',  name: 'Primeiros Socorros',       baseValue: 30, era: ['any'] },
  { id: 'sobrevivencia',       name: 'Sobrevivência',            baseValue: 10, era: ['any'] },

  // ── Transporte ────────────────────────────────────────────────────────────
  { id: 'conduzir-auto',  name: 'Conduzir', specialization: 'Auto',           baseValue: 20, era: ['any'] },
  { id: 'conduzir-barco', name: 'Conduzir', specialization: 'Barco',          baseValue: 20, era: ['any'] },
  { id: 'montar',         name: 'Montar',                                      baseValue: 5,  era: ['1920s'] },
  { id: 'pilotar-aviao',  name: 'Pilotar',  specialization: 'Avião',          baseValue: 1,  era: ['any'] },
  { id: 'pilotar-barco',  name: 'Pilotar',  specialization: 'Barco a Vapor',  baseValue: 1,  era: ['any'] },

  // ── Era Moderna ───────────────────────────────────────────────────────────
  { id: 'computacao',   name: 'Computação',  baseValue: 5, era: ['modern'] },
  { id: 'eletronica',   name: 'Eletrônica',  baseValue: 1, era: ['modern'] },

  // ── Especial ──────────────────────────────────────────────────────────────
  { id: 'hipnose',          name: 'Hipnose',            baseValue: 1,  era: ['any'] },
  { id: 'lidar-animais',    name: 'Lidar com Animais',  baseValue: 5,  era: ['any'] },
  { id: 'mitologia-cthulhu', name: 'Mitologia de Cthulhu', baseValue: 0, era: ['any'], canPush: false },

  // ── Crédito ───────────────────────────────────────────────────────────────
  { id: 'credito', name: 'Crédito', baseValue: 0, era: ['any'] },
];
