import { useState } from 'react';
import type { GMCharacterFormData } from '../../types';

interface Props {
  initialValues?: GMCharacterFormData & { originalName: string };
  onClose: () => void;
  onSubmit: (data: GMCharacterFormData, originalName?: string) => void;
}

const ATTR_LABELS: { key: keyof Pick<GMCharacterFormData, 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'>; abbr: string }[] = [
  { key: 'strength', abbr: 'FOR' },
  { key: 'dexterity', abbr: 'DES' },
  { key: 'constitution', abbr: 'CON' },
  { key: 'intelligence', abbr: 'INT' },
  { key: 'wisdom', abbr: 'SAB' },
  { key: 'charisma', abbr: 'CAR' },
];

const attrBonus = (val: number): string => {
  const mod = Math.floor((val - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export default function CreateNPCModal({ initialValues, onClose, onSubmit }: Props) {
  const iv = initialValues;
  const [name, setName] = useState(iv?.name ?? '');
  const [npcType, setNpcType] = useState<'NPC' | 'Monstro'>(iv?.npcType ?? 'NPC');
  const [race, setRace] = useState(iv?.race ?? '');
  const [charClass, setCharClass] = useState(iv?.charClass ?? '');
  const [level, setLevel] = useState(iv?.level ?? 1);
  const [hpMax, setHpMax] = useState(iv?.hpMax ?? 10);
  const [manaMax, setManaMax] = useState(iv?.manaMax ?? 0);
  const [ac, setAc] = useState(iv?.ac ?? 10);
  const [speed, setSpeed] = useState(iv?.speed ?? 9);
  const [attrs, setAttrs] = useState({
    strength: iv?.strength ?? 10,
    dexterity: iv?.dexterity ?? 10,
    constitution: iv?.constitution ?? 10,
    intelligence: iv?.intelligence ?? 10,
    wisdom: iv?.wisdom ?? 10,
    charisma: iv?.charisma ?? 10,
  });
  const [actions, setActions] = useState(iv?.actions ?? '');
  const [items, setItems] = useState(iv?.items ?? '');
  const [error, setError] = useState('');

  const setAttr = (key: keyof typeof attrs, val: number) =>
    setAttrs((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    const data: GMCharacterFormData = {
      name: name.trim(),
      npcType,
      race,
      charClass,
      level,
      hpMax,
      manaMax,
      ac,
      speed,
      ...attrs,
      actions,
      items,
    };
    onSubmit(data, iv?.originalName);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: 20, overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card card-gold" style={{ maxWidth: 500, width: '100%' }}>
        {/* Title */}
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, color: 'var(--gold)' }}>
            {iv ? 'Editar Personagem' : 'Novo Personagem do Mestre'}
          </h2>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Nome + Tipo */}
        <div className="g2" style={{ marginBottom: 12 }}>
          <div className="form-row">
            <label>Nome</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Ex: Goblin Explorador"
              maxLength={40}
            />
          </div>
          <div className="form-row">
            <label>Tipo</label>
            <select value={npcType} onChange={(e) => setNpcType(e.target.value as 'NPC' | 'Monstro')}>
              <option value="NPC">NPC</option>
              <option value="Monstro">Monstro</option>
            </select>
          </div>
        </div>

        {/* Raça + Classe */}
        <div className="g2" style={{ marginBottom: 12 }}>
          <div className="form-row">
            <label>Raça</label>
            <input
              value={race}
              onChange={(e) => setRace(e.target.value)}
              placeholder="Ex: Goblin"
            />
          </div>
          <div className="form-row">
            <label>Classe / Papel</label>
            <input
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
              placeholder="Ex: Guerreiro"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <p className="sec-title">Estatísticas</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
          <div className="form-row">
            <label>Nível</label>
            <input type="number" min={1} max={20} value={level}
              onChange={(e) => setLevel(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label>PV Máx</label>
            <input type="number" min={1} value={hpMax}
              onChange={(e) => setHpMax(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label>Mana Máx</label>
            <input type="number" min={0} value={manaMax}
              onChange={(e) => setManaMax(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label>CA</label>
            <input type="number" min={0} value={ac}
              onChange={(e) => setAc(Number(e.target.value))} />
          </div>
          <div className="form-row">
            <label>Desl.</label>
            <input type="number" min={0} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>
        </div>

        {/* Atributos */}
        <p className="sec-title">Atributos</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
          {ATTR_LABELS.map(({ key, abbr }) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                {abbr}
              </div>
              <input
                type="number"
                min={1}
                max={30}
                value={attrs[key]}
                onChange={(e) => setAttr(key, Number(e.target.value))}
                style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, padding: '4px 2px' }}
              />
              <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 3, fontWeight: 600 }}>
                {attrBonus(attrs[key])}
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <p className="sec-title">Ações</p>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <textarea
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            placeholder="Descreva as ações que este personagem pode realizar em combate..."
            rows={3}
            style={{ resize: 'vertical', fontSize: 13 }}
          />
        </div>

        {/* Itens */}
        <p className="sec-title">Itens Carregados</p>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Liste os itens que este personagem carrega..."
            rows={3}
            style={{ resize: 'vertical', fontSize: 13 }}
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>{error}</p>}

        <hr className="div" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={handleSubmit}>
            {iv ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
