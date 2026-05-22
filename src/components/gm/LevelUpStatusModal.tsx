import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function LevelUpStatusModal({ onClose }: Props) {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const releaseLevelUp = useStore((s) => s.releaseLevelUp);
  const resetLevelUp = useStore((s) => s.resetLevelUp);

  if (!campaign) return null;

  const playerNames = campaign.playerNames;
  const hasPending = playerNames.some((n) => characters[n]?.pendingLevelUp);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
            Level Up dos Jogadores
          </h2>
          <button className="btn btn-secondary btn-xs" onClick={onClose}>✕</button>
        </div>

        {playerNames.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>Nenhum jogador na campanha.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {playerNames.map((name) => {
              const char = characters[name];
              const pending = char?.pendingLevelUp ?? false;
              return (
                <div
                  key={name}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{char?.name || name}</span>
                    {char && (
                      <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 8 }}>
                        Nível {char.level}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: pending ? 'var(--gold)' : 'var(--hp)' }}>
                    {pending ? '⏳ Pendente' : '✓ Concluído'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,.4)' }}
            disabled={hasPending}
            title={hasPending ? 'Aguarde todos concluírem antes de liberar novamente' : undefined}
            onClick={() => { releaseLevelUp(); onClose(); }}
          >
            ⬆ Liberar Level Up para Todos
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, color: 'var(--text2)' }}
            onClick={() => { resetLevelUp(); onClose(); }}
          >
            ↺ Forçar Reset
          </button>
        </div>
      </div>
    </div>
  );
}
