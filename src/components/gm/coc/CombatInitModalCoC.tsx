import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../store';
import type { CombatantEntry } from '../../../types';

interface Props {
  onClose: () => void;
}

export default function CombatInitModalCoC({ onClose }: Props) {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const startCombat = useStore((s) => s.startCombat);

  const playerNames = useMemo(() => campaign?.playerNames ?? [], [campaign?.playerNames]);
  const inSceneNPCNames = useMemo(
    () => (campaign?.gmCharacterNames ?? []).filter((n) => characters[n]?.inScene),
    [campaign?.gmCharacterNames, characters],
  );

  // In CoC, initiative = DES (descending). Pre-fill from character data.
  const [initiatives, setInitiatives] = useState<Record<string, string>>(() => {
    const all = [...playerNames, ...inSceneNPCNames];
    return Object.fromEntries(all.map((n) => [n, String(characters[n]?.attributes.dexterity ?? 50)]));
  });

  const sortedList = useMemo<CombatantEntry[]>(() => {
    const all = [
      ...playerNames.map((n) => ({ name: n, isNPC: false })),
      ...inSceneNPCNames.map((n) => ({ name: n, isNPC: true })),
    ];
    return all
      .map(({ name, isNPC }) => ({ name, initiative: parseInt(initiatives[name] || '0', 10), isNPC }))
      .sort((a, b) => b.initiative - a.initiative);
  }, [initiatives, playerNames, inSceneNPCNames]);

  const [ordering, setOrdering] = useState<CombatantEntry[]>(sortedList);
  const sortedKey = sortedList.map((c) => `${c.name}:${c.initiative}`).join('|');
  useEffect(() => { setOrdering(sortedList); }, [sortedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const swapAt = (i: number) => {
    setOrdering((prev) => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const handleStart = () => {
    startCombat(ordering);
    onClose();
  };

  const allNames = [...playerNames, ...inSceneNPCNames];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box cinit-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>⚔ Iniciativa (DES)</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancelar</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>
          Em Call of Cthulhu, iniciativa = DES (decrescente). Ajuste se necessário (+50 para armas de fogo).
        </p>

        {/* All combatants */}
        <div style={{ marginBottom: 14 }}>
          <div className="cinit-section-label">Combatentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allNames.map((name) => {
              const char = characters[name];
              const isNPC = inSceneNPCNames.includes(name);
              return (
                <div key={name} className="cinit-row">
                  <span className="cinit-name" style={{ color: isNPC ? 'var(--mana)' : 'var(--gold)' }}>
                    {char?.name || name}
                  </span>
                  <input
                    type="number"
                    className="cinit-input"
                    value={initiatives[name] ?? ''}
                    onChange={(e) => setInitiatives((p) => ({ ...p, [name]: e.target.value }))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sorted order */}
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

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            onClick={handleStart}
            disabled={ordering.length === 0}
          >
            ⚔ Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
