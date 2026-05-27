import { useState } from 'react';
import { useStore } from '../../store';
import type { Character } from '../../types';

interface Props {
  character: Character;
}

type Screen = 'choosing' | 'naming' | 'confirming-abandon';

export default function DeathModal({ character }: Props) {
  const replaceDeadCharacter = useStore((s) => s.replaceDeadCharacter);
  const abandonAfterDeath = useStore((s) => s.abandonAfterDeath);
  const addToast = useStore((s) => s.addToast);

  const [screen, setScreen] = useState<Screen>('choosing');
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateNew = async () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Digite um nome para o personagem.'); return; }
    setLoading(true);
    setNameError('');
    const result = await replaceDeadCharacter(trimmed);
    setLoading(false);
    if (result === 'name_taken') {
      setNameError('Já existe um personagem com esse nome. Escolha outro.');
    } else if (result === 'error') {
      setNameError('Ocorreu um erro. Tente novamente.');
    }
    // On 'ok', App.tsx detects created=false and renders the wizard automatically
  };

  const handleAbandon = async () => {
    setLoading(true);
    await abandonAfterDeath();
    // leaveCampaign is called inside abandonAfterDeath — no further action needed here
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 1000, backdropFilter: 'blur(4px)' }}
      // Not closeable by backdrop click — player must choose
    >
      <div
        className="modal-box"
        style={{ maxWidth: 480, textAlign: 'center', padding: '32px 28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {screen === 'choosing' && (
          <>
            {/* Skull icon */}
            <div style={{ fontSize: 56, marginBottom: 16 }}>💀</div>

            <h2 style={{ fontSize: 22, color: 'var(--danger)', fontFamily: 'Cinzel, serif', marginBottom: 8 }}>
              {character.name} morreu
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
              {character.race} {character.class} — Nível {character.level}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32, lineHeight: 1.6 }}>
              Sua jornada chegou ao fim. O que você deseja fazer?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                className="btn btn-gold w-full"
                style={{ padding: '14px 20px', fontSize: 15 }}
                onClick={() => setScreen('naming')}
              >
                ⚔ Criar novo personagem
              </button>
              <button
                className="btn btn-secondary w-full"
                style={{ padding: '14px 20px', fontSize: 15 }}
                onClick={() => setScreen('confirming-abandon')}
              >
                🚪 Abandonar a campanha
              </button>
            </div>
          </>
        )}

        {screen === 'naming' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚔</div>
            <h2 style={{ fontSize: 20, color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: 8 }}>
              Novo Personagem
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
              Seu novo personagem começará no nível 1. Escolha um nome para ele.
            </p>

            <div className="form-row" style={{ textAlign: 'left', marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
                Nome do personagem
              </label>
              <input
                type="text"
                className="input"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleCreateNew()}
                placeholder="Ex: Aldric Brightshield"
                maxLength={40}
                autoFocus
                disabled={loading}
                style={{ width: '100%' }}
              />
              {nameError && (
                <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{nameError}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setScreen('choosing'); setNameError(''); setNewName(''); }}
                disabled={loading}
              >
                ← Voltar
              </button>
              <button
                className="btn btn-gold"
                onClick={handleCreateNew}
                disabled={loading || !newName.trim()}
              >
                {loading ? 'Criando…' : 'Continuar'}
              </button>
            </div>
          </>
        )}

        {screen === 'confirming-abandon' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚪</div>
            <h2 style={{ fontSize: 20, color: 'var(--text)', fontFamily: 'Cinzel, serif', marginBottom: 12 }}>
              Abandonar a Campanha?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
              Tem certeza? Você poderá voltar a esta campanha no futuro criando um novo personagem com o código da campanha.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 28, lineHeight: 1.5 }}>
              O personagem morto será removido da campanha.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setScreen('choosing')}
                disabled={loading}
              >
                ← Voltar
              </button>
              <button
                className="btn"
                style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)', opacity: loading ? 0.6 : 1 }}
                onClick={handleAbandon}
                disabled={loading}
              >
                {loading ? 'Saindo…' : 'Abandonar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
