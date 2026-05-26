import { useState } from 'react';
import { useStore } from '../../store';
import type { Character } from '../../types';
import tormenta20, { skillTotal } from '../../systems/tormenta20';
import { evalDiceExpr } from '../../utils/dice';

interface Props {
  character: Character;
  onClose: () => void;
}

const ATTR_ABBR: { key: keyof Character['attributes']; abbr: string; label: string }[] = [
  { key: 'strength', abbr: 'FOR', label: 'Força' },
  { key: 'dexterity', abbr: 'DES', label: 'Destreza' },
  { key: 'constitution', abbr: 'CON', label: 'Constituição' },
  { key: 'intelligence', abbr: 'INT', label: 'Inteligência' },
  { key: 'wisdom', abbr: 'SAB', label: 'Sabedoria' },
  { key: 'charisma', abbr: 'CAR', label: 'Carisma' },
];

const ATTR_LABEL: Record<string, string> = {
  strength: 'FOR', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
};

const attrBonus = (val: number): string => {
  const mod = Math.floor((val - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export default function NPCSheetModal({ character: char, onClose }: Props) {
  const rollDice = useStore((s) => s.rollDice);
  const [diceExpr, setDiceExpr] = useState('');

  const handleExprRoll = () => {
    const expr = diceExpr.trim();
    if (!expr) return;
    const { total, breakdown, diceSum, diceMax } = evalDiceExpr(expr, char);
    rollDice({ rollerName: char.name, label: 'Rolagem', diceExpr: expr, breakdown, total, diceSum, diceMax });
  };

  const handleSkillRoll = (skillName: string, modifier: number) => {
    const result = Math.floor(Math.random() * 20) + 1;
    const total = result + modifier;
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    rollDice({ rollerName: char.name, label: skillName, diceExpr: `1d20+${skillName}`, breakdown: `d20[${result}]${modStr}`, total, diceSum: result, diceMax: 20 });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 600, padding: 20, overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card card-gold" style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, color: 'var(--mana)' }}>{char.name}</h2>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              {[char.origin, char.race, char.class].filter(Boolean).join(' · ')} · Nível {char.level}
            </p>
          </div>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Vitals */}
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap', marginBottom: 14 }}>
          <span>PV: <strong style={{ color: 'var(--hp)' }}>{char.vitals.hp.current}/{char.vitals.hp.max}</strong></span>
          {char.vitals.mana.max > 0 && (
            <span>Mana: <strong style={{ color: 'var(--mana)' }}>{char.vitals.mana.current}/{char.vitals.mana.max}</strong></span>
          )}
          <span>CA: <strong style={{ color: 'var(--gold)' }}>{char.vitals.ac}</strong></span>
          <span>Desl.: <strong>{char.speed}q</strong></span>
        </div>

        {/* Attributes */}
        <p className="sec-title" style={{ marginBottom: 8 }}>Atributos</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {ATTR_ABBR.map(({ key, abbr }) => {
            const val = char.attributes[key];
            return (
              <div key={key} style={{ textAlign: 'center', minWidth: 44 }}>
                <div style={{ fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{abbr}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>{attrBonus(val)}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {char.actions && (
          <div style={{ marginBottom: 12 }}>
            <p className="sec-title" style={{ marginBottom: 4 }}>Ações</p>
            <p style={{ fontSize: 12, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{char.actions}</p>
          </div>
        )}

        {/* Items */}
        {char.items && (
          <div style={{ marginBottom: 12 }}>
            <p className="sec-title" style={{ marginBottom: 4 }}>Itens Carregados</p>
            <p style={{ fontSize: 12, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{char.items}</p>
          </div>
        )}

        <hr className="div" />

        {/* Dice expression roller */}
        <p className="sec-title" style={{ marginBottom: 8 }}>Rolagem</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={diceExpr}
            onChange={(e) => setDiceExpr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExprRoll()}
            placeholder="Ex: 1d20+Luta ou 2d6+3+Pontaria"
            style={{ flex: 1, fontSize: 13 }}
          />
          <button className="btn btn-secondary btn-sm" onClick={handleExprRoll} disabled={!diceExpr.trim()}>
            🎲 Rolar
          </button>
        </div>

        {/* Skills */}
        <p className="sec-title" style={{ marginBottom: 6 }}>Perícias</p>
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          <table className="skills-table w-full">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 10, color: 'var(--text2)', paddingBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Perícia</th>
                <th style={{ textAlign: 'center', fontSize: 10, color: 'var(--text2)', paddingBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Atr.</th>
                <th style={{ textAlign: 'right', fontSize: 10, color: 'var(--text2)', paddingBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Bônus</th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {tormenta20.skillList.map((skill) => {
                const attrVal = char.attributes[skill.attribute];
                const mod = Math.floor((attrVal - 10) / 2);
                const bonus = skillTotal(attrVal, false, char.level);
                return (
                  <tr key={skill.id}>
                    <td><span className="skill-name">{skill.name}</span></td>
                    <td style={{ textAlign: 'center' }}><span className="skill-attr">{ATTR_LABEL[skill.attribute]}</span></td>
                    <td className="skill-bonus">{bonus >= 0 ? '+' : ''}{bonus}</td>
                    <td>
                      <button className="btn-ghost btn-sm" onClick={() => handleSkillRoll(skill.name, bonus)}
                        title={`Rolar d20+${bonus}`} style={{ padding: '2px 6px', fontSize: 13 }}>
                        🎲
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
