import { useState } from 'react';
import { useStore } from '../../store';
import PlayerCard from './PlayerCard';
import CampaignSettings from './CampaignSettings';
import GMCharactersTab from './GMCharactersTab';
import DiceLog from '../ui/DiceLog';

type GMTab = 'scene' | 'characters';

export default function GMPanel() {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const diceLog = useStore((s) => s.diceLog);
  const leaveCampaign = useStore((s) => s.leaveCampaign);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<GMTab>('scene');

  if (!campaign) return null;

  const playerNames = campaign.playerNames;
  const gmCharacterNames = campaign.gmCharacterNames ?? [];
  const inSceneNPCNames = gmCharacterNames.filter((n) => characters[n]?.inScene);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h1 style={{ fontSize: 18, color: 'var(--gold)' }}>SheetSync</h1>
          <div
            style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '3px 12px', fontFamily: 'Cinzel, serif',
              letterSpacing: 4, color: 'var(--gold)', fontSize: 15,
            }}
          >
            {campaign.code}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>
            {playerNames.length} jogador{playerNames.length !== 1 ? 'es' : ''}
            {gmCharacterNames.length > 0 &&
              ` · ${gmCharacterNames.length} NPC${gmCharacterNames.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(true)}>
            ⚙ Configurações
          </button>
          <button className="btn btn-secondary btn-sm" onClick={leaveCampaign}>
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 20px', maxWidth: 1200, width: '100%', margin: '0 auto', flex: 1 }}>
        {/* Tab nav */}
        <div className="tab-nav" style={{ marginBottom: 16 }}>
          <button
            className={`tab-btn ${activeTab === 'scene' ? 'active' : ''}`}
            onClick={() => setActiveTab('scene')}
          >
            Cena Atual
            {inSceneNPCNames.length > 0 && (
              <span
                style={{
                  marginLeft: 6, background: 'var(--mana)', borderRadius: 20,
                  padding: '0 6px', fontSize: 10, color: '#fff',
                }}
              >
                {inSceneNPCNames.length} NPC
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}
          >
            Personagens do Mestre
            {gmCharacterNames.length > 0 && (
              <span
                style={{
                  marginLeft: 6, background: 'var(--bg-card2)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '0 6px', fontSize: 10, color: 'var(--text2)',
                }}
              >
                {gmCharacterNames.length}
              </span>
            )}
          </button>
        </div>

        {/* Cena Atual */}
        {activeTab === 'scene' && (
          <>
            {playerNames.length === 0 && inSceneNPCNames.length === 0 ? (
              <div className="empty-state">
                <h3>Aguardando jogadores...</h3>
                <p style={{ marginBottom: 16 }}>
                  Compartilhe o código{' '}
                  <strong style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', letterSpacing: 4 }}>
                    {campaign.code}
                  </strong>{' '}
                  com os jogadores.
                </p>
                <p style={{ fontSize: 12 }}>
                  Eles devem abrir o SheetSync em outra aba e clicar em "Entrar em Campanha (Jogador)".
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 16,
                }}
              >
                {playerNames.map((name) =>
                  characters[name] ? (
                    <PlayerCard key={name} characterName={name} />
                  ) : (
                    <div key={name} className="gm-card" style={{ opacity: 0.5 }}>
                      <div className="gm-card-header">
                        <p style={{ color: 'var(--text2)', fontSize: 13 }}>{name} — conectando...</p>
                      </div>
                    </div>
                  ),
                )}
                {inSceneNPCNames.map((name) =>
                  characters[name] ? (
                    <PlayerCard key={name} characterName={name} isNPC />
                  ) : null,
                )}
              </div>
            )}
            <DiceLog entries={diceLog} />
          </>
        )}

        {/* Personagens do Mestre */}
        {activeTab === 'characters' && <GMCharactersTab />}
      </div>

      {showSettings && <CampaignSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
