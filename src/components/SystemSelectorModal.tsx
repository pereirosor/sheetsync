import { useState } from 'react';
import { SYSTEM_CATALOG } from '../systems';
import { useStore } from '../store';
import type { CampaignSettings } from '../types';

interface Props {
  onConfirm: (systemId: string, extraSettings?: Partial<CampaignSettings>) => void;
  onCancel: () => void;
}

type Era = '1920s' | 'modern';

export default function SystemSelectorModal({ onConfirm, onCancel }: Props) {
  const addToast = useStore((s) => s.addToast);
  const [selected, setSelected] = useState<string | null>(null);
  const [era, setEra] = useState<Era>('1920s');
  const [step, setStep] = useState<'system' | 'era'>('system');

  const handleCardClick = (id: string, available: boolean, needsEra?: boolean) => {
    if (!available) {
      const meta = SYSTEM_CATALOG.find((s) => s.id === id);
      addToast(`${meta?.name ?? id} ainda não está disponível.`, 'info');
      return;
    }
    if (needsEra) {
      setSelected(id);
      setStep('era');
    } else {
      setSelected(id);
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    const meta = SYSTEM_CATALOG.find((s) => s.id === selected);
    if (meta?.needsEra) {
      onConfirm(selected, { cocEra: era });
    } else {
      onConfirm(selected);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {step === 'system' && (
          <>
            <h2 style={{ color: 'var(--gold)', marginBottom: 6, fontSize: 20 }}>Criar Campanha</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
              Escolha o sistema de jogo
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {SYSTEM_CATALOG.map((s) => {
                const isSelected = selected === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleCardClick(s.id, s.available, s.needsEra)}
                    style={{
                      position: 'relative',
                      border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 8,
                      padding: '16px 14px',
                      cursor: s.available ? 'pointer' : 'not-allowed',
                      opacity: s.available ? 1 : 0.45,
                      background: isSelected
                        ? `${s.color}33`
                        : 'var(--bg-card2)',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {!s.available && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'var(--bg-card)',
                          color: 'var(--text2)',
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          letterSpacing: 0.5,
                        }}
                      >
                        Em breve
                      </span>
                    )}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: s.color,
                        marginBottom: 10,
                      }}
                    />
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.shortDesc}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={onCancel}>
                Cancelar
              </button>
              <button
                className="btn btn-gold btn-sm"
                onClick={handleConfirm}
                disabled={!selected}
              >
                Criar
              </button>
            </div>
          </>
        )}

        {step === 'era' && (
          <>
            <button
              className="btn-ghost btn-sm"
              onClick={() => setStep('system')}
              style={{ marginBottom: 16 }}
            >
              ← Voltar
            </button>
            <h2 style={{ color: 'var(--gold)', marginBottom: 6, fontSize: 20 }}>Call of Cthulhu 7ª Ed.</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
              Escolha a ambientação da campanha
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {([
                { value: '1920s', label: 'Anos 1920', desc: 'Era clássica de Lovecraft. Detetives, arqueólogos e acadêmicos contra o inexplicável.' },
                { value: 'modern', label: 'Era Moderna', desc: 'Investigadores contemporâneos. Tecnologia moderna, mesmos horrores antigos.' },
              ] as { value: Era; label: string; desc: string }[]).map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setEra(opt.value)}
                  style={{
                    border: `2px solid ${era === opt.value ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 8,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    background: era === opt.value ? 'rgba(124,74,30,0.15)' : 'var(--bg-card2)',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={onCancel}>
                Cancelar
              </button>
              <button className="btn btn-gold btn-sm" onClick={handleConfirm}>
                Criar campanha
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
