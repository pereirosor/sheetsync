import { useState } from 'react';
import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function DeleteCampaignModal({ onClose }: Props) {
  const campaign = useStore((s) => s.campaign);
  const deleteCampaign = useStore((s) => s.deleteCampaign);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!campaign) return null;

  const totalChars = campaign.playerNames.length + (campaign.gmCharacterNames?.length ?? 0);
  const confirmed = typed.trim().toUpperCase() === campaign.code;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteCampaign();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir a campanha.');
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>⚠</span>
          <h3 style={{ fontSize: 16, color: 'var(--danger)' }}>Excluir Campanha</h3>
        </div>

        {/* Warning */}
        <p style={{
          fontSize: 13, color: 'var(--danger)', background: 'rgba(224,82,82,.08)',
          border: '1px solid rgba(224,82,82,.3)', borderRadius: 6,
          padding: '10px 12px', marginBottom: 16, lineHeight: 1.5,
        }}>
          Esta ação é <strong>irreversível</strong>. Não há como recuperar os dados após a exclusão.
        </p>

        {/* Impact */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5 }}>
            A exclusão removerá permanentemente:
          </p>
          <ul style={{ fontSize: 13, color: 'var(--text)', paddingLeft: 18, lineHeight: 1.8 }}>
            <li>
              <strong>{totalChars}</strong> personagen{totalChars !== 1 ? 's' : ''} vinculado{totalChars !== 1 ? 's' : ''} à campanha
              {campaign.playerNames.length > 0 && campaign.gmCharacterNames?.length > 0 && (
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>
                  {' '}({campaign.playerNames.length} de jogador, {campaign.gmCharacterNames.length} NPC{campaign.gmCharacterNames.length !== 1 ? 's' : ''})
                </span>
              )}
            </li>
            <li>Todas as notas do mestre</li>
            <li>Histórico de combate e dados da campanha</li>
          </ul>
        </div>

        {/* Players currently connected warning */}
        {campaign.playerNames.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
            Os jogadores conectados serão desconectados automaticamente.
          </p>
        )}

        {/* Code confirmation input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
            Digite o código da campanha para confirmar:{' '}
            <strong style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', letterSpacing: 3 }}>
              {campaign.code}
            </strong>
          </label>
          <input
            type="text"
            className="input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={campaign.code}
            autoFocus
            disabled={loading}
            style={{ width: '100%', textTransform: 'uppercase', letterSpacing: 3, fontFamily: 'Cinzel, serif' }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn"
            style={{
              background: confirmed ? 'var(--danger)' : 'rgba(224,82,82,.2)',
              color: '#fff',
              borderColor: 'var(--danger)',
              opacity: confirmed && !loading ? 1 : 0.5,
              cursor: confirmed && !loading ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.15s',
            }}
            disabled={!confirmed || loading}
            onClick={handleDelete}
          >
            {loading ? 'Excluindo…' : 'Excluir Campanha'}
          </button>
        </div>
      </div>
    </div>
  );
}
