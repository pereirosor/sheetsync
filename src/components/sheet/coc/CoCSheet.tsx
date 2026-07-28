import { useState } from 'react';
import { useStore } from '../../../store';
import ProgressBar from '../../ui/ProgressBar';
import DiceRoller from '../DiceRoller';
import CharacteristicsTab from './tabs/CharacteristicsTab';
import SkillsTab from './tabs/SkillsTab';
import EquipmentTab from './tabs/EquipmentTab';
import DeathModal from '../DeathModal';

type TabId = 'characteristics' | 'skills' | 'equipment' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'characteristics', label: 'Características' },
  { id: 'skills',          label: 'Perícias' },
  { id: 'equipment',       label: 'Equipamentos' },
  { id: 'notes',           label: 'Notas' },
];

interface Props {
  /** Ficha a exibir. Omitido = a do próprio jogador logado. */
  characterName?: string;
  /** Visualização sem edição (usado pelo Mestre ao abrir a ficha de um jogador). */
  readOnly?: boolean;
}

export default function CoCSheet({ characterName, readOnly }: Props = {}) {
  const [activeTab, setActiveTab] = useState<TabId>('characteristics');

  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const campaign          = useStore((s) => s.campaign);
  const name              = characterName ?? currentPlayerName;
  const char              = useStore((s) => (name ? s.characters[name] ?? null : null));
  const leaveCampaign        = useStore((s) => s.leaveCampaign);
  const updateCharacter      = useStore((s) => s.updateCharacter);
  const rollCoCDeathCheck    = useStore((s) => s.rollCoCDeathCheck);

  if (!name || !char || !campaign) return null;

  const deathState = char.deathState ?? 'alive';
  const isDying    = deathState === 'dying';
  const isDead     = deathState === 'dead';

  const era      = campaign.settings.cocEra ?? '1920s';
  const eraLabel = era === 'modern' ? 'Era Moderna' : 'Anos 1920';
  const fallbackInitial = (char.name || name).charAt(0).toUpperCase();

  const handleNotesChange = (notes: string) => {
    if (readOnly) return;
    updateCharacter(name, { notes });
  };

  return (
    <>
    {!readOnly && isDead && <DeathModal character={char} />}
    <div className="sheet-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 11, color: 'var(--text2)' }}>
            Campanha <strong style={{ color: 'var(--text)' }}>{campaign.code}</strong>
            {' · '}
            <span style={{ color: 'var(--text2)' }}>Call of Cthulhu · {eraLabel}</span>
          </p>
        </div>
        {!readOnly && (
          <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
            Sair
          </button>
        )}
      </div>

      <div className="sheet-layout">
        {/* Sidebar left */}
        <aside className="sidebar-left">
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--bg-card2)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12, alignSelf: 'center',
          }}>
            {fallbackInitial}
          </div>

          <div className="char-nameblock">
            <h3 style={{ fontSize: 15, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 2 }}>
              {char.name || name}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>
              {char.class || 'Investigador'}
            </p>
          </div>

          {/* Death / insanity state banner */}
          {(isDying || deathState === 'stabilized' || isDead || char.temporaryInsanity || char.indefiniteInsanity || char.majorWound) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {(isDying || deathState === 'stabilized' || isDead) && (
                <div style={{
                  padding: '8px 10px', borderRadius: 6, textAlign: 'center',
                  background: isDead ? 'rgba(224,82,82,.15)' : 'rgba(224,82,82,.08)',
                  border: `1px solid ${isDead ? 'var(--danger)' : 'rgba(224,82,82,.4)'}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: isDying ? 4 : 0 }}>
                    {isDead ? '💀 MORTO' : deathState === 'stabilized' ? '😴 Inconsciente (Estável)' : `🩸 HP 0 — Morrendo`}
                  </div>
                  {!readOnly && isDying && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, marginTop: 2 }}
                      onClick={() => rollCoCDeathCheck(name)}
                      title="d100 ≤ CON para sobreviver"
                    >
                      🎲 Check de CON (d100 ≤ {char.attributes.constitution})
                    </button>
                  )}
                </div>
              )}
              {char.majorWound && (
                <div style={{
                  padding: '5px 10px', borderRadius: 6, textAlign: 'center', fontSize: 11,
                  background: 'rgba(224,82,82,.08)', border: '1px solid rgba(224,82,82,.3)',
                  color: 'var(--danger)',
                }}>
                  🩹 Ferimento Grave
                </div>
              )}
              {(char.temporaryInsanity || char.indefiniteInsanity) && (
                <div style={{
                  padding: '5px 10px', borderRadius: 6, textAlign: 'center', fontSize: 11,
                  background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.3)',
                  color: '#c084fc',
                }}>
                  🌀 {char.indefiniteInsanity ? 'Insanidade Indefinida' : 'Insanidade Temporária'}
                </div>
              )}
            </div>
          )}

          {/* Vitals */}
          <div className="vitals-stack">
            <ProgressBar
              label="PV"
              current={Math.max(0, char.vitals.hp.current)}
              max={char.vitals.hp.max}
              color="var(--hp)"
            />
            <ProgressBar
              label="PM"
              current={char.vitals.mana.current}
              max={char.vitals.mana.max}
              color="var(--mana)"
            />
            <ProgressBar
              label="SAN"
              current={char.vitals.sanity.current}
              max={char.vitals.sanity.max}
              color="var(--sanity)"
            />
          </div>

          {/* Quick stat badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {[
              { label: 'MOV', value: char.speed },
              { label: 'FOR', value: char.attributes.strength },
              { label: 'DES', value: char.attributes.dexterity },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '3px 8px', borderRadius: 4, textAlign: 'center',
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                minWidth: 44,
              }}>
                <div style={{ fontSize: 9, color: 'var(--text2)' }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main area */}
        <main className="sheet-main-area">
          <div className="sheet-main-inner">
            <div className="tab-nav">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              {activeTab === 'characteristics' && (
                <CharacteristicsTab char={char} />
              )}
              {activeTab === 'skills' && (
                <SkillsTab char={char} characterName={name} era={era} />
              )}
              {activeTab === 'equipment' && (
                <EquipmentTab char={char} characterName={name} era={era} readOnly={readOnly} />
              )}
              {activeTab === 'notes' && (
                <textarea
                  value={char.notes || ''}
                  readOnly={readOnly}
                  onChange={e => handleNotesChange(e.target.value)}
                  placeholder="Anotações, background, diário do investigador..."
                  style={{
                    width: '100%', minHeight: 300, padding: 12,
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13,
                    lineHeight: 1.6, resize: 'vertical',
                  }}
                />
              )}
            </div>
          </div>
        </main>

        {/* Sidebar right — rolador só faz sentido para o dono da ficha */}
        {!readOnly && (
          <aside className="sidebar-right">
            <DiceRoller />
          </aside>
        )}
      </div>
    </div>
    </>
  );
}
