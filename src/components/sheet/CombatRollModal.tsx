import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';

export default function CombatRollModal() {
  const combatRollPending = useStore((s) => s.combatRollPending);
  const submitInitiativeRoll = useStore((s) => s.submitInitiativeRoll);
  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const characters = useStore((s) => s.characters);

  const [rolled, setRolled] = useState<{ d20: number; total: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when modal closes and re-opens
  useEffect(() => {
    if (!combatRollPending) setRolled(null);
  }, [combatRollPending]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!combatRollPending) return null;

  const char = currentPlayerName ? characters[currentPlayerName] : null;
  const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
  const iniLabel = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;

  const handleRoll = () => {
    if (rolled) return;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + dexMod;
    setRolled({ d20, total });
    timerRef.current = setTimeout(() => submitInitiativeRoll(total), 1400);
  };

  return (
    <div className="modal-overlay combat-roll-overlay">
      <div className="modal-box combat-roll-box">
        <h3 style={{ fontSize: 16, marginBottom: 6, textAlign: 'center' }}>⚔ Iniciativa</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
          O Mestre iniciou um combate. Role sua iniciativa!
        </p>

        {rolled === null ? (
          <>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20, textAlign: 'center' }}>
              Modificador de Iniciativa:{' '}
              <strong style={{ color: 'var(--gold)' }}>{iniLabel}</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary combat-roll-btn"
                onClick={handleRoll}
              >
                Rolar d20{dexMod !== 0 ? ` ${iniLabel}` : ''}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div className="combat-roll-result">
              {rolled.total}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
              d20 [{rolled.d20}]{dexMod !== 0 ? ` ${iniLabel}` : ''} = {rolled.total}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
              Enviando resultado...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
