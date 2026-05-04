import { useState } from 'react';
import { useStore } from '../../store';
import type { VitalKey } from '../../types';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

interface Props {
  characterName: string;
  isNPC?: boolean;
}

type ActiveVital = VitalKey;

export default function PlayerCard({ characterName, isNPC }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const campaign = useStore((s) => s.campaign);
  const updateVital = useStore((s) => s.updateVital);
  const applyRest = useStore((s) => s.applyRest);
  const addToast = useStore((s) => s.addToast);
  const toggleNPCInScene = useStore((s) => s.toggleNPCInScene);

  const [customDelta, setCustomDelta] = useState('');
  const [isHeal, setIsHeal] = useState(false);
  const [activeVital, setActiveVital] = useState<ActiveVital>('hp');

  if (!char || !campaign) return null;

  const applyDelta = (field: VitalKey, delta: number) => {
    updateVital(characterName, field, delta);
    const label = field === 'hp' ? 'PV' : field === 'mana' ? 'Mana' : 'Sanidade';
    if (delta < 0) addToast(`${char.name}: −${Math.abs(delta)} ${label}`, 'damage');
    else addToast(`${char.name}: +${delta} ${label}`, 'heal');
  };

  const applyCustom = () => {
    const val = parseInt(customDelta, 10);
    if (!val || isNaN(val)) return;
    applyDelta(activeVital, isHeal ? val : -val);
    setCustomDelta('');
  };

  const handleShortRest = () => {
    applyRest(characterName, 'short');
    addToast(`${char.name}: Descanso curto!`, 'heal');
  };

  const handleLongRest = () => {
    applyRest(characterName, 'long');
    addToast(`${char.name}: Descanso longo! (PV/Mana cheios)`, 'success');
  };

  const vitals = char.vitals;
  const hasMana = vitals.mana.max > 0;
  const hasSanity = campaign.settings.sanityEnabled;

  const VITAL_OPTS: { key: VitalKey; label: string; color: string; show: boolean }[] = [
    { key: 'hp', label: 'PV', color: 'var(--hp)', show: true },
    { key: 'mana', label: 'Mana', color: 'var(--mana)', show: hasMana },
    { key: 'sanity', label: 'San.', color: 'var(--sanity)', show: hasSanity },
  ];

  return (
    <div className="gm-card" style={isNPC ? { borderLeft: '3px solid var(--mana)' } : undefined}>
      <div className="gm-card-header">
        <div className="flex-between">
          <div>
            <h3 style={{ fontSize: 15, color: isNPC ? 'var(--mana)' : 'var(--gold)' }}>{char.name || characterName}</h3>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              {[char.race, char.class].filter(Boolean).join(' · ')} · Nível {char.level}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Badge label="CA" value={vitals.ac} color="var(--gold)" />
            <Badge label="Desl." value={`${char.speed}q`} />
          </div>
        </div>
      </div>

      <div className="gm-card-body">
        {/* Vital bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <ProgressBar label="PV" current={vitals.hp.current} max={vitals.hp.max} color="var(--hp)" />
          {hasMana && (
            <ProgressBar label="Mana" current={vitals.mana.current} max={vitals.mana.max} color="var(--mana)" />
          )}
          {hasSanity && (
            <ProgressBar label="Sanidade" current={vitals.sanity.current} max={vitals.sanity.max} color="var(--sanity)" />
          )}
        </div>

        {/* Quick vital buttons */}
        <div style={{ marginBottom: 12 }}>
          {VITAL_OPTS.filter((v) => v.show).map((v) => (
            <div key={v.key} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: v.color, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                {v.label}
              </div>
              <div className="vcontrols">
                {[-5, -1].map((d) => (
                  <button
                    key={d}
                    className="vbtn dmg"
                    onClick={() => applyDelta(v.key, d)}
                    title={`${d}`}
                  >
                    {d}
                  </button>
                ))}
                <span style={{ fontSize: 12, color: 'var(--text2)', padding: '0 4px', minWidth: 50, textAlign: 'center' }}>
                  {vitals[v.key].current}/{vitals[v.key].max}
                </span>
                {[1, 5].map((d) => (
                  <button
                    key={d}
                    className="vbtn heal"
                    onClick={() => applyDelta(v.key, d)}
                    title={`+${d}`}
                  >
                    +{d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Aplicar Dano / Cura</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Target vital */}
            <select
              value={activeVital}
              onChange={(e) => setActiveVital(e.target.value as ActiveVital)}
              style={{ width: 72, fontSize: 12, padding: '4px 6px' }}
            >
              <option value="hp">PV</option>
              {hasMana && <option value="mana">Mana</option>}
              {hasSanity && <option value="sanity">San.</option>}
            </select>
            {/* +/- toggle */}
            <button
              className={`vbtn ${isHeal ? 'heal' : 'dmg'}`}
              onClick={() => setIsHeal(!isHeal)}
              title="Alternar dano/cura"
              style={{ width: 36 }}
            >
              {isHeal ? '+' : '−'}
            </button>
            <input
              type="number"
              min={0}
              value={customDelta}
              onChange={(e) => setCustomDelta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
              placeholder="0"
              style={{ width: 70, textAlign: 'center', fontSize: 13 }}
            />
            <button className="btn btn-secondary btn-sm" onClick={applyCustom}>
              Aplicar
            </button>
          </div>
        </div>

        {/* Rest buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: 11 }}
            onClick={handleShortRest}
          >
            ☽ Descanso Curto
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: 11, color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            onClick={handleLongRest}
          >
            ☀ Descanso Longo
          </button>
        </div>

        {isNPC && (
          <>
            <hr className="div" />
            <button
              className="btn btn-secondary btn-sm w-full"
              style={{ fontSize: 11, color: 'var(--text2)' }}
              onClick={() => toggleNPCInScene(characterName)}
            >
              ✕ Remover da Cena
            </button>
          </>
        )}
      </div>
    </div>
  );
}
