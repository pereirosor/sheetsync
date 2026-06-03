import { useState } from 'react';
import { useStore } from '../../../store';
import ProgressBar from '../../ui/ProgressBar';
import DiceRoller from '../DiceRoller';
import CharacteristicsTab from './tabs/CharacteristicsTab';
import SkillsTab from './tabs/SkillsTab';

type TabId = 'characteristics' | 'skills' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'characteristics', label: 'Características' },
  { id: 'skills',          label: 'Perícias' },
  { id: 'notes',           label: 'Notas' },
];

export default function CoCSheet() {
  const [activeTab, setActiveTab] = useState<TabId>('characteristics');

  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const campaign          = useStore((s) => s.campaign);
  const char              = useStore((s) =>
    s.currentPlayerName ? s.characters[s.currentPlayerName] : null,
  );
  const leaveCampaign     = useStore((s) => s.leaveCampaign);
  const updateCharacter   = useStore((s) => s.updateCharacter);

  if (!currentPlayerName || !char || !campaign) return null;

  const era      = campaign.settings.cocEra ?? '1920s';
  const eraLabel = era === 'modern' ? 'Era Moderna' : 'Anos 1920';
  const fallbackInitial = (char.name || currentPlayerName).charAt(0).toUpperCase();

  const handleNotesChange = (notes: string) => {
    updateCharacter(currentPlayerName, { notes });
  };

  return (
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
        <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
          Sair
        </button>
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
              {char.name || currentPlayerName}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>
              {char.class || 'Investigador'}
            </p>
          </div>

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
                <SkillsTab char={char} characterName={currentPlayerName} era={era} />
              )}
              {activeTab === 'notes' && (
                <textarea
                  value={char.notes || ''}
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

        {/* Sidebar right */}
        <aside className="sidebar-right">
          <DiceRoller />
        </aside>
      </div>
    </div>
  );
}
