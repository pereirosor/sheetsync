import { useStore } from '../store';
import { getSystem } from '../systems';
import type { GameSystem } from '../types';

export function useActiveSystem(): GameSystem {
  const campaign = useStore((s) => s.campaign);
  return getSystem(campaign?.gameSystemId ?? 'tormenta20');
}
