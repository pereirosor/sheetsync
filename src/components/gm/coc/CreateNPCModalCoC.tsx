import { useState, useEffect } from 'react';
import type { GMCharacterFormDataCoC } from '../../../types';
import { calcHP, calcSAN, CHARACTERISTIC_DEFS } from '../../../systems/coc7e/characteristics';

interface Props {
  onClose: () => void;
  onSubmit: (data: GMCharacterFormDataCoC) => void;
}

type CoCAttrs = { strength: number; constitution: number; size: number; dexterity: number; appearance: number; intelligence: number; power: number; education: number };

const DEFAULT_ATTRS: CoCAttrs = {
  strength: 50, constitution: 50, size: 65, dexterity: 50,
  appearance: 50, intelligence: 65, power: 50, education: 65,
};

export default function CreateNPCModalCoC({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [npcType, setNpcType] = useState<'NPC' | 'Monstro' | 'Criatura'>('NPC');
  const [attrs, setAttrs] = useState<CoCAttrs>(DEFAULT_ATTRS);
  const [hpMax, setHpMax] = useState(calcHP(DEFAULT_ATTRS.constitution, DEFAULT_ATTRS.size));
  const [sanMax, setSanMax] = useState(calcSAN(DEFAULT_ATTRS.power));
  const [hpOverride, setHpOverride] = useState(false);
  const [sanOverride, setSanOverride] = useState(false);
  const [speed, setSpeed] = useState(8);
  const [skillsText, setSkillsText] = useState('');
  const [actions, setActions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hpOverride) setHpMax(calcHP(attrs.constitution, attrs.size));
  }, [attrs.constitution, attrs.size, hpOverride]);

  useEffect(() => {
    if (!sanOverride) setSanMax(calcSAN(attrs.power));
  }, [attrs.power, sanOverride]);

  const setAttr = (key: keyof CoCAttrs, val: number) =>
    setAttrs((prev) => ({ ...prev, [key]: Math.max(1, Math.min(100, val)) }));

  const handleSubmit = () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return; }
    const data: GMCharacterFormDataCoC = {
      name: name.trim(), npcType,
      strength: attrs.strength, constitution: attrs.constitution,
      size: attrs.size, dexterity: attrs.dexterity,
      appearance: attrs.appearance, intelligence: attrs.intelligence,
      power: attrs.power, education: attrs.education,
      hpMax, sanMax, speed, skillsText, actions,
    };
    onSubmit(data);
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
      <div className="card card-gold" style={{ maxWidth: 520, width: '100%' }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, color: 'var(--gold)' }}>Novo Personagem do Mestre</h2>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Nome + Tipo */}
        <div className="g2" style={{ marginBottom: 12 }}>
          <div className="form-row">
            <label>Nome</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Ex: Cultista, Gul, Shoggoth"
              maxLength={40}
            />
          </div>
          <div className="form-row">
            <label>Tipo</label>
            <select value={npcType} onChange={(e) => setNpcType(e.target.value as GMCharacterFormDataCoC['npcType'])}>
              <option value="NPC">NPC</option>
              <option value="Monstro">Monstro</option>
              <option value="Criatura">Criatura</option>
            </select>
          </div>
        </div>

        {/* Características */}
        <p className="sec-title" style={{ marginBottom: 8 }}>Características (%)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {CHARACTERISTIC_DEFS.map(({ key, abbr, name: label }) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                {abbr}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text2)', marginBottom: 3 }}>{label}</div>
              <input
                type="number" min={1} max={100}
                value={attrs[key]}
                onChange={(e) => setAttr(key, Number(e.target.value))}
                style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, padding: '4px 2px' }}
              />
              <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
                ½ {Math.floor(attrs[key] / 2)} · ⅕ {Math.floor(attrs[key] / 5)}
              </div>
            </div>
          ))}
        </div>

        {/* Derivados */}
        <p className="sec-title" style={{ marginBottom: 8 }}>Derivados</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              PV Máx
              <button
                style={{ fontSize: 9, color: hpOverride ? 'var(--gold)' : 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setHpOverride((v) => !v)}
                title={hpOverride ? 'Usando valor manual' : 'Clique para substituir'}
              >
                {hpOverride ? '✏' : '⚙ auto'}
              </button>
            </div>
            <input
              type="number" min={1}
              value={hpMax}
              onChange={(e) => { setHpOverride(true); setHpMax(Number(e.target.value)); }}
              style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, width: '100%' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              SAN Máx
              <button
                style={{ fontSize: 9, color: sanOverride ? 'var(--gold)' : 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setSanOverride((v) => !v)}
                title={sanOverride ? 'Usando valor manual' : 'Clique para substituir'}
              >
                {sanOverride ? '✏' : '⚙ auto'}
              </button>
            </div>
            <input
              type="number" min={0}
              value={sanMax}
              onChange={(e) => { setSanOverride(true); setSanMax(Number(e.target.value)); }}
              style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, width: '100%' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3 }}>MOV</div>
            <input
              type="number" min={1} max={20}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, width: '100%' }}
            />
          </div>
        </div>

        {/* Perícias */}
        <p className="sec-title">Perícias</p>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <textarea
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Ex: Lutar (Briga) 50%, Pistola 40%, Furtividade 60%, Percepção 35%"
            rows={3}
            style={{ resize: 'vertical', fontSize: 13 }}
          />
        </div>

        {/* Ações */}
        <p className="sec-title">Ações</p>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <textarea
            value={actions}
            onChange={(e) => setActions(e.target.value)}
            placeholder="Descreva ataques, manobras e ações especiais..."
            rows={3}
            style={{ resize: 'vertical', fontSize: 13 }}
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>{error}</p>}

        <hr className="div" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={handleSubmit}>Criar</button>
        </div>
      </div>
    </div>
  );
}
