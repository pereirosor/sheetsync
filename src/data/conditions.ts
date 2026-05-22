export interface ConditionDef {
  name: string;
  description: string;
}

export const CONDITIONS: ConditionDef[] = [
  { name: 'Abalado', description: '-2 em testes e ataques; não pode se concentrar em magias.' },
  { name: 'Apavorado', description: '-2 em testes e dano; deve fugir da fonte do medo se puder.' },
  { name: 'Atordoado', description: 'Perde a ação de movimento e tem -2 em testes e CA.' },
  { name: 'Caído', description: '-5 em ataques; -2 CA contra corpo a corpo; +4 CA contra distância.' },
  { name: 'Cego', description: 'Falha automática em testes visuais; -2 CA; inimigos têm +2 para acertar.' },
  { name: 'Confuso', description: 'Age aleatoriamente a cada rodada: ataca aliado, fica parado ou se move.' },
  { name: 'Enfeitiçado', description: 'Trata a fonte como amigo especial; não pode atacá-la ou prejudicá-la.' },
  { name: 'Enjoado', description: '-2 em testes, ataques e dano; não pode usar magias ou poderes.' },
  { name: 'Envenenado', description: '-2 em testes e atributos (varia pelo veneno); penalidades contínuas.' },
  { name: 'Exausto', description: '-6 em Força e Destreza; deslocamento reduzido à metade.' },
  { name: 'Fascinado', description: '-4 em Percepção; não pode agir até o fim do efeito.' },
  { name: 'Imóvel', description: 'Não pode se mover; -4 CA contra ataques corpo a corpo.' },
  { name: 'Incorporal', description: 'Imune a dano não mágico; pode atravessar objetos sólidos.' },
  { name: 'Invisível', description: '+2 em ataques; inimigos perdem bônus de Destreza na CA.' },
  { name: 'Lento', description: 'Apenas uma ação padrão ou de movimento por rodada, não ambas.' },
  { name: 'Paralisado', description: 'Incapaz de agir; CA limitada à armadura; ataques adjacentes acertam automaticamente.' },
  { name: 'Sangrando', description: 'Perde 1 PV por rodada; requer ação padrão e Cura CD 15 para estancar.' },
  { name: 'Surdo', description: '-4 em iniciativa; sem comunicação verbal; magias com componente verbal falham.' },
];

export const CONDITION_MAP: Record<string, ConditionDef> = Object.fromEntries(
  CONDITIONS.map((c) => [c.name, c]),
);
