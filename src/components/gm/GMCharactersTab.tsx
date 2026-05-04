import { useState } from 'react';
import { useStore } from '../../store';
import type { Character, GMCharacterFormData } from '../../types';
import CreateNPCModal from './CreateNPCModal';

type EditTarget = GMCharacterFormData & { originalName: string };

const buildFormData = (char: Character): EditTarget => ({
  originalName: char.name,
  name: char.name,
  npcType: (char.origin as 'NPC' | 'Monstro') ?? 'NPC',
  race: char.race,
  charClass: char.class,
  level: char.level,
  hpMax: char.vitals.hp.max,
  manaMax: char.vitals.mana.max,
  ac: char.vitals.ac,
  speed: char.speed,
  strength: char.attributes.strength,
  dexterity: char.attributes.dexterity,
  constitution: char.attributes.constitution,
  intelligence: char.attributes.intelligence,
  wisdom: char.attributes.wisdom,
  charisma: char.attributes.charisma,
});

export default function GMCharactersTab() {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const createGMCharacter = useStore((s) => s.createGMCharacter);
  const updateGMCharacter = useStore((s) => s.updateGMCharacter);
  const deleteGMCharacter = useStore((s) => s.deleteGMCharacter);
  const toggleNPCInScene = useStore((s) => s.toggleNPCInScene);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  if (!campaign) return null;

  const gmNames = campaign.gmCharacterNames ?? [];
  const gmChars = gmNames.map((n) => characters[n]).filter(Boolean) as Character[];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <p className="sec-title" style={{ margin: 0 }}>
          Personagens do Mestre ({gmChars.length})
        </p>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Novo
        </button>
      </div>

      {/* Empty state */}
      {gmChars.length === 0 && (
        <div className="empty-state">
          <h3 style={{ marginBottom: 8 }}>Nenhum personagem criado</h3>
          <p style={{ fontSize: 12 }}>
            Crie NPCs e Monstros para gerenciar durante a cena. Use o toggle "Na cena" para adicioná-los à Cena Atual.
          </p>
        </div>
      )}

      {/* Character list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gmChars.map((char) => (
          <div key={char.name} className="gm-card">
            <div className="gm-card-header">
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: 14, color: 'var(--gold)' }}>{char.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    {[char.origin, char.race, char.class].filter(Boolean).join(' · ')}
                    {` · Nível ${char.level}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* Na cena toggle */}
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      cursor: 'pointer', textTransform: 'none',
                      letterSpacing: 'normal', fontSize: 12,
                      color: char.inScene ? 'var(--gold)' : 'var(--text2)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={char.inScene}
                      onChange={() => toggleNPCInScene(char.name)}
                    />
                    Na cena
                  </label>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => setEditTarget(buildFormData(char))}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => {
                      if (confirm(`Excluir "${char.name}"? Esta ação não pode ser desfeita.`)) {
                        deleteGMCharacter(char.name);
                      }
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* Vitals summary */}
            <div className="gm-card-body" style={{ padding: '8px 16px' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
                <span>
                  PV:{' '}
                  <strong style={{ color: 'var(--hp)' }}>
                    {char.vitals.hp.current}/{char.vitals.hp.max}
                  </strong>
                </span>
                {char.vitals.mana.max > 0 && (
                  <span>
                    Mana:{' '}
                    <strong style={{ color: 'var(--mana)' }}>
                      {char.vitals.mana.current}/{char.vitals.mana.max}
                    </strong>
                  </span>
                )}
                <span>
                  CA: <strong style={{ color: 'var(--gold)' }}>{char.vitals.ac}</strong>
                </span>
                <span>
                  Desl.: <strong>{char.speed}q</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateNPCModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createGMCharacter(data)}
        />
      )}
      {editTarget && (
        <CreateNPCModal
          initialValues={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(data, originalName) => updateGMCharacter(originalName!, data)}
        />
      )}
    </div>
  );
}
