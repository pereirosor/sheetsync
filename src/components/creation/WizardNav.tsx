interface Props {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLast?: boolean;
  loading?: boolean;
}

export default function WizardNav({ onBack, onNext, nextLabel, nextDisabled, isLast, loading }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      {onBack && (
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          ← Voltar
        </button>
      )}
      <button
        className="btn btn-gold"
        style={{ flex: 2, opacity: nextDisabled ? 0.55 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}
        onClick={onNext}
        disabled={loading}
      >
        {loading ? 'Aguarde...' : (nextLabel ?? (isLast ? 'Finalizar e Entrar' : 'Próximo →'))}
      </button>
    </div>
  );
}
