import { useStore } from '../../store';
import tormenta20 from '../../systems/tormenta20';

interface Props {
  characterName: string;
}

const SIZES = ['Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau',
];

export default function IdentityTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  const upd = (field: string, value: unknown) =>
    updateCharacter(characterName, { [field]: value } as never);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="g3">
        <div className="form-row">
          <label>Nome</label>
          <input value={char.name} onChange={(e) => upd('name', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Raça</label>
          <input value={char.race} onChange={(e) => upd('race', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Classe</label>
          <select value={char.class} onChange={(e) => upd('class', e.target.value)}>
            <option value="">— Selecione —</option>
            {tormenta20.classList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="g3">
        <div className="form-row">
          <label>Origem</label>
          <input value={char.origin} onChange={(e) => upd('origin', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Nível</label>
          <input
            type="number" min={1} max={20} value={char.level}
            onChange={(e) => upd('level', Number(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label>Tendência</label>
          <select value={char.alignment} onChange={(e) => upd('alignment', e.target.value)}>
            <option value="">— Selecione —</option>
            {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="g3">
        <div className="form-row">
          <label>Divindade</label>
          <input value={char.deity} onChange={(e) => upd('deity', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Tamanho</label>
          <select value={char.size} onChange={(e) => upd('size', e.target.value)}>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Deslocamento (quadrados)</label>
          <input
            type="number" min={0} value={char.speed}
            onChange={(e) => upd('speed', Number(e.target.value))}
          />
        </div>
      </div>

      <hr className="div" />
      <p className="sec-title">Estatísticas Vitais</p>

      <div className="g3">
        <div className="form-row">
          <label>PV Máximo</label>
          <input
            type="number" min={0} value={char.vitals.hp.max}
            onChange={(e) => {
              const max = Number(e.target.value);
              updateCharacter(characterName, {
                vitals: { ...char.vitals, hp: { current: Math.min(char.vitals.hp.current, max), max } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>PV Atual</label>
          <input
            type="number" min={0} max={char.vitals.hp.max} value={char.vitals.hp.current}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, hp: { ...char.vitals.hp, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>Classe de Armadura</label>
          <input
            type="number" min={0} value={char.vitals.ac}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, ac: Number(e.target.value) },
              });
            }}
          />
        </div>
      </div>

      <div className="g2">
        <div className="form-row">
          <label>Mana Máxima</label>
          <input
            type="number" min={0} value={char.vitals.mana.max}
            onChange={(e) => {
              const max = Number(e.target.value);
              updateCharacter(characterName, {
                vitals: { ...char.vitals, mana: { current: Math.min(char.vitals.mana.current, max), max } },
              });
            }}
          />
        </div>
        <div className="form-row">
          <label>Mana Atual</label>
          <input
            type="number" min={0} max={char.vitals.mana.max} value={char.vitals.mana.current}
            onChange={(e) => {
              updateCharacter(characterName, {
                vitals: { ...char.vitals, mana: { ...char.vitals.mana, current: Number(e.target.value) } },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
