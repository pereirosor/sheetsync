import { useState } from 'react';
import { useStore } from '../store';

export default function Dashboard() {
  const user = useStore((s) => s.user);
  const myCampaigns = useStore((s) => s.myCampaigns);
  const pendingGMCode = useStore((s) => s.pendingGMCode);
  const signOut = useStore((s) => s.signOut);
  const createCampaign = useStore((s) => s.createCampaign);
  const confirmGMEntry = useStore((s) => s.confirmGMEntry);
  const openCampaign = useStore((s) => s.openCampaign);
  const joinCampaign = useStore((s) => s.joinCampaign);

  const [view, setView] = useState<'main' | 'join'>('main');
  const [code, setCode] = useState('');
  const [charName, setCharName] = useState('');
  const [error, setError] = useState('');
  const [opening, setOpening] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await createCampaign();
    setCreating(false);
  };

  const handleOpen = async (campaignCode: string) => {
    setOpening(campaignCode);
    await openCampaign(campaignCode);
    setOpening(null);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = charName.trim();
    if (!trimmedCode || !trimmedName) {
      setError('Preencha o código e o nome do personagem.');
      return;
    }
    setJoining(true);
    const result = await joinCampaign(trimmedCode, trimmedName);
    setJoining(false);
    if (result === 'not_found') setError('Campanha não encontrada. Verifique o código.');
    else if (result === 'name_taken') setError('Já existe um personagem com esse nome. Escolha outro.');
    else if (result !== 'ok') setError(`Erro: ${result}`);
  };

  // Show pending GM code screen after campaign creation
  if (pendingGMCode) {
    return (
      <div className="home-wrap">
        <div className="home-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: 8 }}>Campanha Criada!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
            Compartilhe este código com os jogadores:
          </p>
          <div
            style={{
              background: 'var(--bg-card2)',
              border: '2px solid var(--gold)',
              borderRadius: 8,
              padding: '20px 32px',
              fontSize: 40,
              fontFamily: 'Cinzel, serif',
              letterSpacing: 12,
              color: 'var(--gold)',
              marginBottom: 12,
              userSelect: 'all',
            }}
          >
            {pendingGMCode}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 28 }}>
            Clique no código para selecionar e copiar
          </p>
          <button
            className="btn btn-gold w-full"
            style={{ fontSize: 15, padding: '12px 20px' }}
            onClick={confirmGMEntry}
          >
            Entrar no Painel do Mestre →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrap">
      <div className="home-card" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--gold)', margin: 0 }}>SheetSync</h1>
            <p style={{ color: 'var(--text2)', fontSize: 12, margin: 0 }}>{user?.email}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={signOut}>Sair</button>
        </div>

        {view === 'main' && (
          <>
            {/* My campaigns */}
            {myCampaigns.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  Minhas campanhas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myCampaigns.map((c) => (
                    <div
                      key={c.code}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-card2)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '10px 14px',
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', letterSpacing: 2, fontSize: 15 }}>
                          {c.code}
                        </span>
                        <span
                          style={{
                            marginLeft: 10,
                            fontSize: 11,
                            color: c.role === 'gm' ? 'var(--gold)' : 'var(--text2)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {c.role === 'gm' ? 'Mestre' : 'Jogador'}
                        </span>
                      </div>
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => handleOpen(c.code)}
                        disabled={opening === c.code}
                      >
                        {opening === c.code ? '...' : 'Abrir'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-gold w-full"
                onClick={handleCreate}
                disabled={creating}
                style={{ padding: '13px 20px', fontSize: 15 }}
              >
                {creating ? 'Criando...' : '⚔ Criar Campanha (Mestre)'}
              </button>
              <button
                className="btn btn-secondary w-full"
                onClick={() => { setView('join'); setError(''); }}
                style={{ padding: '13px 20px', fontSize: 15 }}
              >
                ✦ Entrar por Código (Jogador)
              </button>
            </div>
          </>
        )}

        {view === 'join' && (
          <>
            <button
              className="btn-ghost btn-sm"
              onClick={() => { setView('main'); setError(''); }}
              style={{ marginBottom: 16 }}
            >
              ← Voltar
            </button>
            <h2 style={{ color: 'var(--gold)', marginBottom: 20 }}>Entrar em Campanha</h2>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-row">
                <label>Código da Campanha</label>
                <input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="Ex: AB3X9K"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: 8, fontSize: 22, fontFamily: 'Cinzel, serif', padding: '10px 12px' }}
                />
              </div>
              <div className="form-row">
                <label>Nome do Personagem</label>
                <input
                  value={charName}
                  onChange={(e) => { setCharName(e.target.value); setError(''); }}
                  placeholder="Ex: Theron Nightblade"
                  maxLength={40}
                />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
              <button
                type="submit"
                className="btn btn-gold w-full"
                style={{ padding: '12px 20px', fontSize: 15 }}
                disabled={joining}
              >
                {joining ? 'Entrando...' : 'Entrar na Campanha'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
