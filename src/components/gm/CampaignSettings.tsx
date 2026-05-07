import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function CampaignSettings({ onClose }: Props) {
  const campaign = useStore((s) => s.campaign);
  const updateSettings = useStore((s) => s.updateSettings);
  const deleteCampaign = useStore((s) => s.deleteCampaign);

  if (!campaign) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(campaign.code).catch(() => {/* ignore */});
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card card-gold" style={{ maxWidth: 420, width: '100%' }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, color: 'var(--gold)' }}>Configurações da Campanha</h2>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Code */}
        <div style={{ marginBottom: 20 }}>
          <p className="sec-title">Código da Campanha</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div
              style={{
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '8px 16px', fontSize: 26,
                fontFamily: 'Cinzel, serif', letterSpacing: 8, color: 'var(--gold)',
                flex: 1, textAlign: 'center',
              }}
            >
              {campaign.code}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyCode}>
              Copiar
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
            Compartilhe este código com os jogadores para que entrem na campanha.
          </p>
        </div>

        {/* Danger zone */}
        <hr className="div" />
        <button
          className="btn btn-danger w-full"
          onClick={() => {
            if (confirm('Encerrar a campanha? Todos os dados serão removidos.')) {
              deleteCampaign();
            }
          }}
        >
          Encerrar Campanha
        </button>
      </div>
    </div>
  );
}
