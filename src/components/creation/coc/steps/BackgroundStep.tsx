import type { CoCWizardState } from '../wizardState';

interface Props {
  state: CoCWizardState;
  update: (patch: Partial<CoCWizardState>) => void;
}

const BG_FIELDS: { key: keyof CoCWizardState['background']; label: string; placeholder: string }[] = [
  { key: 'ideology',           label: 'Ideologias e Crenças',    placeholder: 'O que seu investigador acredita?' },
  { key: 'importantPerson',    label: 'Pessoa Importante',       placeholder: 'Quem é importante para seu investigador?' },
  { key: 'meaningfulLocation', label: 'Lugar Significativo',     placeholder: 'Um local especial na memória do personagem.' },
  { key: 'treasuredPossession', label: 'Pertence Precioso',      placeholder: 'Algo que ele não abre mão.' },
  { key: 'trait',              label: 'Traço de Personalidade',   placeholder: 'Uma característica marcante.' },
  { key: 'injuriesScars',      label: 'Ferimentos e Cicatrizes', placeholder: 'Marcas físicas ou traumas.' },
  { key: 'phobiasManias',      label: 'Fobias e Manias',         placeholder: 'Medos irracionais ou compulsões.' },
  { key: 'tomesSpells',        label: 'Tomos e Magias',          placeholder: 'Livros arcanos ou magias conhecidas.' },
  { key: 'encounters',         label: 'Encontros com o Arcano',  placeholder: 'Contatos passados com o sobrenatural.' },
  { key: 'fellowInvestigator', label: 'Colega Investigador',     placeholder: 'Um outro investigador do grupo.' },
];

export default function BackgroundStep({ state, update }: Props) {
  const setBg = (key: keyof CoCWizardState['background'], value: string) => {
    update({ background: { ...state.background, [key]: value } });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Nome do Investigador *
          </label>
          <input
            type="text"
            value={state.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Nome completo"
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ width: 80 }}>
          <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
            Idade *
          </label>
          <input
            type="number"
            value={state.age}
            onChange={e => update({ age: Math.max(15, Math.min(90, Number(e.target.value))) })}
            min={15}
            max={90}
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 16 }}>
        Preencha os campos de background para dar vida ao seu investigador. Todos são opcionais, mas enriquecem a narrativa.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {BG_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>
              {label}
            </label>
            <input
              type="text"
              value={state.background[key]}
              onChange={e => setBg(key, e.target.value)}
              placeholder={placeholder}
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
