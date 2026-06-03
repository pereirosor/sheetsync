import tormenta20 from './tormenta20';
import coc7e from './coc7e';
import type { GameSystem } from '../types';

export const SYSTEMS: Record<string, GameSystem> = {
  tormenta20,
  coc7e,
};

export type SystemId = keyof typeof SYSTEMS;

export interface SystemMeta {
  id: string;
  name: string;
  shortDesc: string;
  color: string;
  available: boolean;
  needsEra?: boolean;
}

export const SYSTEM_CATALOG: SystemMeta[] = [
  {
    id: 'tormenta20',
    name: 'Tormenta 20',
    shortDesc: 'Fantasia épica brasileira',
    color: '#7c4a1e',
    available: true,
  },
  {
    id: 'coc7e',
    name: 'Call of Cthulhu 7ª Ed.',
    shortDesc: 'Horror cósmico investigativo',
    color: '#2a4a2a',
    available: true,
    needsEra: true,
  },
  {
    id: 'dnd5e',
    name: 'D&D 5E',
    shortDesc: 'Fantasia clássica',
    color: '#6a1f1f',
    available: false,
  },
  {
    id: 'ordemParanormal',
    name: 'Ordem Paranormal',
    shortDesc: 'Mistério paranormal',
    color: '#3a1f5a',
    available: false,
  },
];

export function getSystem(id: string): GameSystem {
  return SYSTEMS[id] ?? tormenta20;
}
