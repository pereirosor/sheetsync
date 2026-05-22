import { useState } from 'react';
import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';
import type { CombatantEntry } from '../../types';

interface Props {
  onClose: () => void;
}

export default function CombatInitModal({ onClose }: Props) {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const startCombat = useStore((s) => s.startCombat);

  const playerNames = campaign?.playerNames ?? [];
  const gmCharacterNames = campaign?.gmCharacterNames ?? [];
  const inSceneNPCNames = gmCharacterNames.filter((n) => characters[n]?.inScene);
  const allNames = [...playerNames, ...inSceneNPCNames];

  const [initiatives, setInitiatives] = useState<Record<string, string>>(
    () => Object.fromEntries(allNames.map((n) => [n, ''])),
  );

  const rollForName = (name: string) => {
    const char = characters[name];
    const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
    const roll = Math.floor(Math.random() * 20) + 1 + dexMod;
    setInitiatives((prev) => ({ ...prev, [name]: String(roll) }));
  };

  const rollAll = () => {
    const next: Record<string, string> = {};
    for (const name of allNames) {
      const char = characters[name];
      const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
      next[name] = String(Math.floor(Math.random() * 20) + 1 + dexMod);
    }
    setInitiatives((prev) => ({ ...prev, ...next }));
  };

  const handleStart = () => {
    const combatants: CombatantEntry[] = allNames.map((name) => ({
      name,
      initiative: parseInt(initiatives[name] || '0', 10),
      isNPC: inSceneNPCNames.includes(name),
    }));
    startCombat(combatants);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Iniciar Combate</h3>
          <button className="btn btn-secondary btn-sm" onClick={rollAll}>
            Rolar Todos (d20+Ini)
          </button>
        </div>

        {allNames.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
            Nenhum personagem na cena.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {allNames.map((name) => {
              const char = characters[name];
              const isNPC = inSceneNPCNames.includes(name);
              const dexMod = char ? calcMod2(char.attributes.dexterity) : 0;
              const iniLabel = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
              return (
                <div key={name} className="cinit-row">
                  <div className="cinit-name">
                    <span style={{ color: isNPC ? 'var(--mana)' : 'var(--gold)', fontWeight: 600 }}>
                      {char?.name || name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 6 }}>
                      {char ? [char.race, char.class].filter(Boolean).join(' ') : ''} · Ini {iniLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="number"
                      className="cinit-input"
                      value={initiatives[name]}
                      onChange={(e) => setInitiatives((p) => ({ ...p, [name]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                      placeholder="0"
                    />
                    <button className="btn btn-secondary btn-xs" onClick={() => rollForName(name)}>
                      d20
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            onClick={handleStart}
          >
            ⚔ Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
