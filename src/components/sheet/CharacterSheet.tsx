import { useState } from 'react';
import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';
import { CONDITION_MAP } from '../../data/conditions';
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
import CombatRollModal from './CombatRollModal';
import LevelUpWizard from '../levelup/LevelUpWizard';
import DeathModal from './DeathModal';

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
  const [showLevelUp, setShowLevelUp] = useState(false);

  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const campaign = useStore((s) => s.campaign);
  const char = useStore((s) =>
    s.currentPlayerName ? s.characters[s.currentPlayerName] : null,
  );
  const leaveCampaign = useStore((s) => s.leaveCampaign);
  const combatState = useStore((s) => s.combatState);
  const rollDeathSave = useStore((s) => s.rollDeathSave);

  if (!currentPlayerName || !char || !campaign) return null;

  const deathState = char.deathState ?? 'alive';
  const isDying = deathState === 'dying';
  const isDead = deathState === 'dead';

  const { vitals } = char;
  const fallbackInitial = (char.name || currentPlayerName).charAt(0).toUpperCase();
  const iniMod = calcMod2(char.attributes.dexterity);
  const iniDisplay = iniMod >= 0 ? `+${iniMod}` : `${iniMod}`;

  return (
    <>
    <CombatRollModal />
    {isDead && <DeathModal character={char} />}
    {showLevelUp && !isDead && (
      <LevelUpWizard characterName={currentPlayerName} onClose={() => setShowLevelUp(false)} />
    )}
    <div className="sheet-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 11, color: 'var(--text2)' }}>
            Campanha <strong style={{ color: 'var(--text)' }}>{campaign.code}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {char.pendingLevelUp && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.5)', fontWeight: 600 }}
              onClick={() => setShowLevelUp(true)}
            >
              ⬆ Subir de Nível
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
            Sair
          </button>
        </div>
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

          {/* Death state banner */}
          {(isDying || deathState === 'stabilized' || isDead) && (
            <div style={{
              padding: '8px 12px', borderRadius: 6, marginBottom: 8,
              background: isDead ? 'rgba(224,82,82,.15)' : 'rgba(224,82,82,.08)',
              border: `1px solid ${isDead ? 'var(--danger)' : 'rgba(224,82,82,.4)'}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
                {isDead ? '💀 MORTO' : deathState === 'stabilized' ? '😴 Estabilizado' : `🩸 Sangrando (${vitals.hp.current} PV)`}
              </div>
              {isDying && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, marginTop: 4 }}
                  onClick={() => rollDeathSave(currentPlayerName)}
                  title="d20 + mod. CON + nível/2 vs CD 15"
                >
                  🎲 Testar Constituição (CD 15)
                </button>
              )}
            </div>
          )}

          <div className="vitals-stack">
            <ProgressBar
              label="PV"
              current={Math.max(0, vitals.hp.current)}
              max={vitals.hp.max}
              color={isDying || isDead ? 'var(--danger)' : 'var(--hp)'}
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

          {/* Active conditions */}
          {(char.conditions ?? []).length > 0 && (
            <div className="player-conditions">
              <div className="player-conditions-title">Condições Ativas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(char.conditions ?? []).map((c) => (
                  <div key={c} className="condition-badge-wrapper">
                    <span className="condition-badge condition-badge--active">{c}</span>
                    <div className="condition-tooltip condition-tooltip--above">{CONDITION_MAP[c]?.description ?? c}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {combatState?.active && (
            <div className="combat-status">
              <div className="combat-status-header">
                <span>⚔</span>
                <span>Combate · Rodada {combatState.round}</span>
              </div>
              <div className="combat-status-turn">
                Vez de:{' '}
                <strong style={{ color: 'var(--gold)' }}>
                  {combatState.combatants[combatState.currentIndex]?.name ?? '—'}
                </strong>
              </div>
              <div className="combat-status-list">
                {combatState.combatants.map((c, i) => (
                  <div
                    key={c.name}
                    className={`combat-status-item${i === combatState.currentIndex ? ' active' : ''}${c.name === currentPlayerName ? ' me' : ''}`}
                  >
                    <span className="combat-status-ini">{c.initiative}</span>
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </>
  );
}
