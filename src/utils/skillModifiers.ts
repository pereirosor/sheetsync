import { skillTotal } from '../systems/tormenta20';
import type { Character, SkillDef, RaceInfo } from '../types';

export interface SkillBonusSource {
  source: string;
  value: number;
}

export interface SkillBreakdown {
  base: number;
  others: SkillBonusSource[];
  total: number;
}

export function getSkillBreakdown(
  char: Character,
  skill: SkillDef,
  raceInfo?: RaceInfo,
): SkillBreakdown {
  const attrVal = char.attributes[skill.attribute];
  const trained = char.skills[skill.id] ?? false;
  const base = skillTotal(attrVal, trained, char.level);

  const others: SkillBonusSource[] = [];

  const raceBonus = raceInfo?.skillBonuses?.[skill.id];
  if (raceBonus) {
    others.push({ source: char.race, value: raceBonus });
  }

  for (const item of char.equipment) {
    if (!item.equipped) continue;
    for (const effect of item.effects ?? []) {
      if (effect.type === 'skillBonus' && effect.skillId === skill.id) {
        others.push({ source: item.name || 'Item', value: effect.value });
      }
    }
  }

  for (const mod of char.activeModifiers ?? []) {
    if (mod.type === 'skillBonus' && mod.skillId === skill.id) {
      others.push({ source: mod.source, value: mod.value });
    }
  }

  const bonus = others.reduce((s, o) => s + o.value, 0);
  return { base, others, total: base + bonus };
}
