import { useStore } from '../../store';

export default function CombatTracker() {
  const combatState = useStore((s) => s.combatState);
  const nextTurn = useStore((s) => s.nextTurn);
  const endCombat = useStore((s) => s.endCombat);
  const characters = useStore((s) => s.characters);

  if (!combatState?.active) return null;

  const { combatants, currentIndex, round } = combatState;

  return (
    <div className="combat-tracker">
      <div className="combat-tracker-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: 13 }}>⚔ Combate</span>
          <span className="combat-round-badge">Rodada {round}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            onClick={nextTurn}
          >
            Próximo Turno ▶
          </button>
          <button className="btn btn-secondary btn-sm" onClick={endCombat}>
            ✕ Encerrar
          </button>
        </div>
      </div>
      <div className="combat-list">
        {combatants.map((c, i) => {
          const char = characters[c.name];
          const isCurrent = i === currentIndex;
          return (
            <div key={c.name} className={`combat-item${isCurrent ? ' active' : ''}`}>
              <span className="combat-ini">{c.initiative}</span>
              <span className="combat-name" style={{ color: c.isNPC ? 'var(--mana)' : 'var(--gold)' }}>
                {char?.name || c.name}
              </span>
              {char && (
                <span className="combat-hp">
                  {char.vitals.hp.current}/{char.vitals.hp.max} PV
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
