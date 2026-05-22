import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';
import type { CombatantEntry } from '../../types';

export default function CombatInitModal() {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const combatPendingRolls = useStore((s) => s.combatPendingRolls);
  const cancelCombatRequest = useStore((s) => s.cancelCombatRequest);
  const startCombat = useStore((s) => s.startCombat);

  const playerNames = useMemo(() => campaign?.playerNames ?? [], [campaign?.playerNames]);
  const inSceneNPCNames = useMemo(
    () => (campaign?.gmCharacterNames ?? []).filter((n) => characters[n]?.inScene),
    [campaign?.gmCharacterNames, characters],
  );

  const [npcInitiatives, setNpcInitiatives] = useState<Record<string, string>>(
    () => Object.fromEntries(inSceneNPCNames.map((n) => [n, ''])),
  );

  // Sorted list built from all available data (rolls + NPC inputs)
  const sortedList = useMemo<CombatantEntry[]>(() => {
    const entries: CombatantEntry[] = [];
    for (const name of playerNames) {
      const roll = combatPendingRolls?.[name];
      if (roll != null) entries.push({ name, initiative: roll, isNPC: false });
    }
    for (const name of inSceneNPCNames) {
      const val = parseInt(npcInitiatives[name] || '0', 10);
      entries.push({ name, initiative: isNaN(val) ? 0 : val, isNPC: true });
    }
    return [...entries].sort((a, b) => b.initiative - a.initiative);
  }, [combatPendingRolls, npcInitiatives, playerNames, inSceneNPCNames]);

  // GM-adjustable ordering (only resets when underlying data changes)
  const [ordering, setOrdering] = useState<CombatantEntry[]>(sortedList);
  const sortedKey = sortedList.map((c) => `${c.name}:${c.initiative}`).join('|');
  useEffect(() => {
    setOrdering(sortedList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedKey]);

  const swapAt = (i: number) => {
    setOrdering((prev) => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const rollNPC = (name: string) => {
    const char = characters[name];
    const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
    setNpcInitiatives((p) => ({ ...p, [name]: String(Math.floor(Math.random() * 20) + 1 + dexMod) }));
  };

  const rollAllNPCs = () => {
    const next: Record<string, string> = {};
    for (const name of inSceneNPCNames) {
      const dexMod = characters[name] ? calcMod2(characters[name].attributes.dexterity) : 0;
      next[name] = String(Math.floor(Math.random() * 20) + 1 + dexMod);
    }
    setNpcInitiatives((p) => ({ ...p, ...next }));
  };

  const pendingCount = playerNames.filter((n) => combatPendingRolls?.[n] == null).length;
  const canStart = ordering.length > 0;

  const handleStart = () => startCombat(ordering);

  return (
    <div className="modal-overlay" onClick={cancelCombatRequest}>
      <div className="modal-box cinit-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>⚔ Iniciativa</h3>
          <button className="btn btn-secondary btn-sm" onClick={cancelCombatRequest}>Cancelar</button>
        </div>

        {/* Player roll status */}
        {playerNames.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div className="cinit-section-label">Jogadores</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {playerNames.map((name) => {
                const roll = combatPendingRolls?.[name];
                return (
                  <div key={name} className="cinit-row">
                    <span className="cinit-name" style={{ color: 'var(--gold)' }}>{name}</span>
                    <span style={{ fontSize: 13, fontWeight: roll != null ? 700 : 400, color: roll != null ? 'var(--success)' : 'var(--text2)' }}>
                      {roll != null ? roll : 'Aguardando...'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NPC initiative inputs */}
        {inSceneNPCNames.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="cinit-section-label" style={{ marginBottom: 0 }}>NPCs</span>
              <button className="btn btn-secondary btn-xs" onClick={rollAllNPCs}>Rolar Todos</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {inSceneNPCNames.map((name) => {
                const char = characters[name];
                const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
                const iniLabel = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
                return (
                  <div key={name} className="cinit-row">
                    <div className="cinit-name">
                      <span style={{ color: 'var(--mana)', fontWeight: 600 }}>{char?.name || name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 6 }}>Ini {iniLabel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        className="cinit-input"
                        value={npcInitiatives[name] ?? ''}
                        onChange={(e) => setNpcInitiatives((p) => ({ ...p, [name]: e.target.value }))}
                        placeholder="0"
                      />
                      <button className="btn btn-secondary btn-xs" onClick={() => rollNPC(name)}>d20</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sorted order + tie-breaking */}
        {ordering.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="cinit-section-label">Ordem de iniciativa</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
              {ordering.map((c, i) => (
                <div key={c.name}>
                  <div className="combat-item" style={{ padding: '6px 12px' }}>
                    <span className="combat-ini">{c.initiative}</span>
                    <span className="combat-name" style={{ color: c.isNPC ? 'var(--mana)' : 'var(--gold)' }}>
                      {characters[c.name]?.name || c.name}
                    </span>
                  </div>
                  {i < ordering.length - 1 && ordering[i + 1].initiative === c.initiative && (
                    <div className="cinit-tie-row">
                      <button className="btn btn-secondary btn-xs cinit-swap-btn" onClick={() => swapAt(i)}>
                        ↕ Trocar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          {pendingCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>
              Aguardando {pendingCount} jogador{pendingCount !== 1 ? 'es' : ''}...
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            onClick={handleStart}
            disabled={!canStart}
          >
            ⚔ Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
