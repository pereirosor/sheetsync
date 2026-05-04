import { useCampaign } from '../hooks/useCampaign';

export default function HomePage() {
  const {
    view,
    code,
    setCode,
    charName,
    setCharName,
    error,
    pendingGMCode,
    handleCreate,
    handleJoin,
    confirmGMEntry,
    goToJoin,
    goHome,
  } = useCampaign();

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
      {view === 'home' && (
        <div className="home-card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>SheetSync</h1>
            <p style={{ color: 'var(--text2)' }}>Fichas de RPG em Tempo Real · Tormenta 20</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn btn-gold w-full"
              onClick={handleCreate}
              style={{ padding: '14px 20px', fontSize: 15 }}
            >
              ⚔ Criar Campanha (Mestre)
            </button>
            <button
              className="btn btn-secondary w-full"
              onClick={goToJoin}
              style={{ padding: '14px 20px', fontSize: 15 }}
            >
              ✦ Entrar em Campanha (Jogador)
            </button>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 11, marginTop: 24 }}>
            Sincronização em tempo real via abas do navegador
          </p>
        </div>
      )}

      {view === 'join' && (
        <div className="home-card">
          <button
            className="btn-ghost btn-sm"
            onClick={goHome}
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
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: AB3X9K"
                maxLength={6}
                style={{
                  textAlign: 'center',
                  letterSpacing: 8,
                  fontSize: 22,
                  fontFamily: 'Cinzel, serif',
                  padding: '10px 12px',
                }}
              />
            </div>
            <div className="form-row">
              <label>Nome do Personagem</label>
              <input
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="Ex: Theron Nightblade"
                maxLength={40}
              />
            </div>
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>
            )}
            <button
              type="submit"
              className="btn btn-gold w-full"
              style={{ padding: '12px 20px', fontSize: 15 }}
            >
              Entrar na Campanha
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
