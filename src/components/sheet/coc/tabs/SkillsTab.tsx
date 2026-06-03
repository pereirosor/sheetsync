import { useStore } from '../../../../store';
import {
  COC_SKILLS,
  calcSkillBase,
  getSkillDisplayName,
  getSkillsForEra,
} from '../../../../systems/coc7e/skills';
import type { Character } from '../../../../types';

interface Props {
  char: Character;
  characterName: string;
  era: '1920s' | 'modern';
}

function cocSuccessLevel(roll: number, skillValue: number): { label: string; color: string } {
  const extreme = Math.floor(skillValue / 5);
  const hard    = Math.floor(skillValue / 2);
  const fumble  = skillValue < 50 ? 96 : 100;
  if (roll >= fumble)             return { label: 'Fumble!',           color: '#e05252' };
  if (roll > skillValue)          return { label: 'Falha',             color: '#e08042' };
  if (roll <= extreme)            return { label: 'Sucesso Extremo!',  color: '#76d7c4' };
  if (roll <= hard)               return { label: 'Sucesso Difícil',   color: '#5dade2' };
  return                                  { label: 'Sucesso Regular',  color: '#82e0aa' };
}

export default function SkillsTab({ char, characterName, era }: Props) {
  const rollDice      = useStore(s => s.rollDice);
  const currentPlayer = useStore(s => s.currentPlayerName);
  const isOwnSheet    = currentPlayer === characterName;

  const dex = char.attributes.dexterity;
  const edu = char.attributes.education;

  const skills = getSkillsForEra(era);
  const cocSkills = char.cocSkills ?? {};

  const handleRoll = (skillId: string, displayName: string) => {
    const skill = COC_SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const base = calcSkillBase(skill, dex, edu);
    const val  = cocSkills[skillId] ?? base;
    const roll = Math.floor(Math.random() * 100) + 1;
    const { label } = cocSuccessLevel(roll, val);
    rollDice({
      rollerName: characterName,
      label: `${displayName} (${val}%) — ${label}`,
      diceExpr: '1d100',
      breakdown: `${roll}`,
      total: roll,
      diceSum: roll,
      diceMax: 100,
    });
  };

  // Group skills by category
  const grouped: { label: string; ids: string[] }[] = [
    { label: 'Combate', ids: ['lutar-briga', 'lutar-faca', 'lutar-espada', 'lutar-lanca', 'lutar-machado', 'lutar-chicote', 'arma-fogo-pistola', 'arma-fogo-rifle', 'arma-fogo-automatica', 'arma-fogo-pesada', 'arremessar'] },
    { label: 'Investigação', ids: ['percepcao', 'escuta', 'pista', 'rastrear', 'psicologia', 'usar-biblioteca'] },
    { label: 'Interpessoal', ids: ['charme', 'intimidacao', 'labia', 'persuadir'] },
    { label: 'Acadêmico', ids: ['arqueologia', 'antropologia', 'astronomia', 'contabilidade', 'direito', 'historia', 'medicina', 'mundo-natural', 'ocultismo', 'psicanalise'] },
    { label: 'Técnico', ids: ['abrir-fechaduras', 'avaliar', 'conserto-eletrico', 'conserto-mecanico', 'demolição', 'disfarce', 'mergulho', 'navegar', 'operar-maquinaria', 'prestidigitacao', 'primeiros-socorros', 'sobrevivencia'] },
    { label: 'Físico', ids: ['escalada', 'esquivar', 'furtividade', 'natacao', 'saltar'] },
    { label: 'Transporte', ids: ['conduzir-auto', 'conduzir-barco', 'montar', 'pilotar-aviao', 'pilotar-barco'] },
    { label: 'Moderno', ids: ['computacao', 'eletronica'] },
    { label: 'Especial', ids: ['hipnose', 'lidar-animais', 'lingua-nativa', 'mitologia-cthulhu', 'credito'] },
  ];

  const shownIds = new Set<string>();

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Dynamic skills banner */}
      <div style={{
        padding: '6px 10px', borderRadius: 6, marginBottom: 12, fontSize: 11, color: 'var(--text2)',
        background: 'var(--bg-card2)', border: '1px solid var(--border)',
      }}>
        Esquivar base: <strong>{Math.floor(dex / 2)}%</strong>
        {' · '}
        Língua Nativa: <strong>{edu}%</strong>
      </div>

      {grouped.map(({ label, ids }) => {
        const skillsInGroup = ids
          .map(id => skills.find(s => s.id === id))
          .filter((s): s is NonNullable<typeof s> => !!s);
        if (skillsInGroup.length === 0) return null;
        skillsInGroup.forEach(s => shownIds.add(s.id));
        return (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {skillsInGroup.map(skill => {
                const base = calcSkillBase(skill, dex, edu);
                const val  = cocSkills[skill.id] ?? base;
                const half  = Math.floor(val / 2);
                const fifth = Math.floor(val / 5);
                const raised = val > base;
                return (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 8px', borderRadius: 4,
                      background: raised ? 'rgba(201,168,76,.06)' : 'transparent',
                      cursor: isOwnSheet ? 'pointer' : 'default',
                    }}
                    onClick={isOwnSheet ? () => handleRoll(skill.id, getSkillDisplayName(skill)) : undefined}
                    title={isOwnSheet ? `Rolar ${getSkillDisplayName(skill)} (${val}%)` : undefined}
                  >
                    <span style={{
                      flex: 1, fontSize: 12,
                      color: raised ? 'var(--text)' : 'var(--text2)',
                      fontWeight: raised ? 600 : 400,
                    }}>
                      {getSkillDisplayName(skill)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', minWidth: 60, textAlign: 'right' }}>
                      ½ {half} · ⅕ {fifth}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: 'right',
                      color: raised ? 'var(--gold)' : 'var(--text2)',
                    }}>
                      {val}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Remainder: Arte, Ciência, Idioma specializations */}
      {(() => {
        const remaining = skills.filter(s => !shownIds.has(s.id));
        if (remaining.length === 0) return null;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Especializações
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {remaining.map(skill => {
                const base = calcSkillBase(skill, dex, edu);
                const val  = cocSkills[skill.id] ?? base;
                const raised = val > base;
                return (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 8px', borderRadius: 4,
                      cursor: isOwnSheet ? 'pointer' : 'default',
                    }}
                    onClick={isOwnSheet ? () => handleRoll(skill.id, getSkillDisplayName(skill)) : undefined}
                  >
                    <span style={{ flex: 1, fontSize: 12, color: raised ? 'var(--text)' : 'var(--text3)', fontWeight: raised ? 600 : 400 }}>
                      {getSkillDisplayName(skill)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: raised ? 'var(--gold)' : 'var(--text3)' }}>
                      {val}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
