import { useState } from 'react';
import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import AvatarUpload from './AvatarUpload';
import IdentityTab from './IdentityTab';
import AttributesTab from './AttributesTab';
import SkillsTab from './SkillsTab';
import EquipmentTab from './EquipmentTab';
import SpellsTab from './SpellsTab';
import NotesTab from './NotesTab';
import DiceRoller from './DiceRoller';

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
  const fallbackInitial = (char.name || currentPlayerName).charAt(0).toUpperCase();
  const iniMod = calcMod2(char.attributes.dexterity);
  const iniDisplay = iniMod >= 0 ? `+${iniMod}` : `${iniMod}`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 11, color: 'var(--text2)' }}>
            Campanha <strong style={{ color: 'var(--text)' }}>{campaign.code}</strong>
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
          Sair
        </button>
      </div>

      {/* 3-column layout */}
      <div className="sheet-layout">
        {/* Sidebar esquerda */}
        <aside className="sidebar-left">
          <AvatarUpload characterName={currentPlayerName} fallbackInitial={fallbackInitial} />

          <div className="char-nameblock">
            <h3 style={{ fontSize: 15, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 2 }}>
              {char.name || currentPlayerName}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>
              {char.class || '—'} · Nível {char.level}
            </p>
          </div>

          {/* Mini-grid de identidade */}
          <div className="identity-mini">
            <div className="identity-mini-item">
              <span className="identity-mini-label">Raça</span>
              <span className="identity-mini-value">{char.race || '—'}</span>
            </div>
            <div className="identity-mini-item">
              <span className="identity-mini-label">Classe</span>
              <span className="identity-mini-value">{char.class || '—'}</span>
            </div>
            <div className="identity-mini-item">
              <span className="identity-mini-label">Nível</span>
              <span className="identity-mini-value">{char.level}</span>
            </div>
            <div className="identity-mini-item">
              <span className="identity-mini-label">Origem</span>
              <span className="identity-mini-value">{char.origin || '—'}</span>
            </div>
            {char.alignment && (
              <div className="identity-mini-item" style={{ gridColumn: '1 / -1' }}>
                <span className="identity-mini-label">Tendência</span>
                <span className="identity-mini-value">{char.alignment}</span>
              </div>
            )}
          </div>

          <div className="vitals-stack">
            <ProgressBar
              label="PV"
              current={vitals.hp.current}
              max={vitals.hp.max}
              color="var(--hp)"
            />
            {vitals.mana.max > 0 && (
              <ProgressBar
                label="Mana"
                current={vitals.mana.current}
                max={vitals.mana.max}
                color="var(--mana)"
              />
            )}
            {campaign.settings.sanityEnabled && (
              <ProgressBar
                label="Sanidade"
                current={vitals.sanity.current}
                max={vitals.sanity.max}
                color="var(--sanity)"
              />
            )}
          </div>

          <div className="passives-row">
            <Badge label="CA" value={vitals.ac} color="var(--gold)" />
            <Badge label="Ini" value={iniDisplay} color="var(--gold)" />
            <Badge label="Desl." value={`${char.speed}q`} />
          </div>
        </aside>

        {/* Área central — tabs */}
        <main className="sheet-main-area">
          <div className="sheet-main-inner">
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

            <div>
              {activeTab === 'identity' && <IdentityTab characterName={currentPlayerName} />}
              {activeTab === 'attributes' && <AttributesTab characterName={currentPlayerName} />}
              {activeTab === 'skills' && <SkillsTab characterName={currentPlayerName} />}
              {activeTab === 'equipment' && <EquipmentTab characterName={currentPlayerName} />}
              {activeTab === 'spells' && <SpellsTab characterName={currentPlayerName} />}
              {activeTab === 'notes' && <NotesTab characterName={currentPlayerName} />}
            </div>
          </div>
        </main>

        {/* Sidebar direita — rolador de dados */}
        <aside className="sidebar-right">
          <DiceRoller />
        </aside>
      </div>
    </div>
  );
}
