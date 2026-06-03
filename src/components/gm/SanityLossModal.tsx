import { useState } from 'react';
import { useStore } from '../../store';

interface Props {
  onClose: () => void;
}

export default function SanityLossModal({ onClose }: Props) {
  const campaign         = useStore(s => s.campaign);
  const characters       = useStore(s => s.characters);
  const applySanityLoss  = useStore(s => s.applySanityLoss);

  const playerNames = campaign?.playerNames ?? [];
  const [target, setTarget]   = useState(playerNames[0] ?? '');
  const [amount, setAmount]   = useState(1);

  const char = characters[target];

  const handleApply = () => {
    if (!target || amount <= 0) return;
    applySanityLoss(target, amount);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 16, color: 'var(--gold)', marginBottom: 16, fontFamily: 'Cinzel, serif' }}>
          🌀 Perda de Sanidade
        </h2>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Investigador
          </label>
          <select
            value={target}
            onChange={e => setTarget(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text)', padding: '6px 10px', fontSize: 13,
            }}
          >
            {playerNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {char && (
          <div style={{
            padding: '8px 12px', borderRadius: 6, marginBottom: 12,
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text2)',
          }}>
            SAN atual: <strong style={{ color: 'var(--sanity)' }}>
              {char.vitals.sanity.current} / {char.vitals.sanity.max}
            </strong>
            {char.temporaryInsanity && (
              <span style={{ marginLeft: 8, color: 'var(--danger)', fontSize: 11 }}>
                • Insanidade Temporária
              </span>
            )}
            {char.indefiniteInsanity && (
              <span style={{ marginLeft: 8, color: 'var(--danger)', fontSize: 11 }}>
                • Insanidade Indefinida
              </span>
            )}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Pontos de Sanidade perdidos
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 12px', fontSize: 16 }}
              onClick={() => setAmount(a => Math.max(1, a - 1))}
            >−</button>
            <input
              type="number"
              min={1}
              max={99}
              value={amount}
              onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
              style={{
                width: 60, textAlign: 'center',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text)', padding: '6px', fontSize: 16, fontWeight: 700,
              }}
            />
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 12px', fontSize: 16 }}
              onClick={() => setAmount(a => Math.min(99, a + 1))}
            >+</button>
          </div>
          {amount >= 5 && (
            <p style={{ fontSize: 11, color: '#c084fc', marginTop: 6 }}>
              ⚠ Perda ≥ 5 SAN — causa insanidade temporária.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn"
            style={{
              flex: 1, background: '#7e22ce', borderColor: '#a855f7',
              color: '#fff', fontWeight: 600,
            }}
            onClick={handleApply}
            disabled={!target || amount <= 0}
          >
            Aplicar Perda
          </button>
        </div>
      </div>
    </div>
  );
}
