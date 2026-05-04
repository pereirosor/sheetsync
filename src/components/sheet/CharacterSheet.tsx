import { useState } from 'react';
import { useStore } from '../../store';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import IdentityTab from './IdentityTab';
import AttributesTab from './AttributesTab';
import SkillsTab from './SkillsTab';
import EquipmentTab from './EquipmentTab';
import SpellsTab from './SpellsTab';
import NotesTab from './NotesTab';

type TabId = 'identity' | 'attributes' | 'skills' | 'equipment' | 'spells' | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'identity', label: 'Identidade' },
  { id: 'attributes', label: 'Atributos' },
  { id: 'skills', label: 'Perícias' },
  { id: 'equipment', label: 'Equipamentos' },
  { id: 'spells', label: 'Magias' },
  { id: 'notes', label: 'Notas' },
];

export default function CharacterSheet() {
  const [activeTab, setActiveTab] = useState<TabId>('identity');

  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const campaign = useStore((s) => s.campaign);
  const char = useStore((s) =>
    s.currentPlayerName ? s.characters[s.currentPlayerName] : null,
  );
  const leaveCampaign = useStore((s) => s.leaveCampaign);

  if (!currentPlayerName || !char || !campaign) return null;

  const { vitals } = char;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 16, color: 'var(--gold)' }}>
            {char.name || currentPlayerName}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text2)' }}>
            {char.class || '—'} · Nível {char.level} · Campanha{' '}
            <strong style={{ color: 'var(--text)' }}>{campaign.code}</strong>
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
          Sair
        </button>
      </div>

      <div style={{ padding: '14px 16px', maxWidth: 900, width: '100%', margin: '0 auto', flex: 1 }}>
        {/* Vitals header */}
        <div className="vitals-header">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: '1 1 160px' }}>
              <ProgressBar
                label="PV"
                current={vitals.hp.current}
                max={vitals.hp.max}
                color="var(--hp)"
              />
            </div>
            {vitals.mana.max > 0 && (
              <div style={{ flex: '1 1 160px' }}>
                <ProgressBar
                  label="Mana"
                  current={vitals.mana.current}
                  max={vitals.mana.max}
                  color="var(--mana)"
                />
              </div>
            )}
            {campaign.settings.sanityEnabled && (
              <div style={{ flex: '1 1 160px' }}>
                <ProgressBar
                  label="Sanidade"
                  current={vitals.sanity.current}
                  max={vitals.sanity.max}
                  color="var(--sanity)"
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Badge label="CA" value={vitals.ac} color="var(--gold)" />
              <Badge label="Desl." value={`${char.speed}q`} />
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'identity' && <IdentityTab characterName={currentPlayerName} />}
          {activeTab === 'attributes' && <AttributesTab characterName={currentPlayerName} />}
          {activeTab === 'skills' && <SkillsTab characterName={currentPlayerName} />}
          {activeTab === 'equipment' && <EquipmentTab characterName={currentPlayerName} />}
          {activeTab === 'spells' && <SpellsTab characterName={currentPlayerName} />}
          {activeTab === 'notes' && <NotesTab characterName={currentPlayerName} />}
        </div>
      </div>
    </div>
  );
}
