import { useStore } from '../../store';
import { calcMod2 } from '../../systems/tormenta20';
import type { AttributeKey } from '../../types';

interface Props {
  characterName: string;
}

const ATTRS: { key: AttributeKey; label: string; abbr: string }[] = [
  { key: 'strength', label: 'Força', abbr: 'FOR' },
  { key: 'dexterity', label: 'Destreza', abbr: 'DES' },
  { key: 'constitution', label: 'Constituição', abbr: 'CON' },
  { key: 'intelligence', label: 'Inteligência', abbr: 'INT' },
  { key: 'wisdom', label: 'Sabedoria', abbr: 'SAB' },
  { key: 'charisma', label: 'Carisma', abbr: 'CAR' },
];

export default function AttributesTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  const setAttr = (key: AttributeKey, value: number) => {
    updateCharacter(characterName, {
      attributes: { ...char.attributes, [key]: value },
    });
  };

  return (
    <div>
      <p className="sec-title">Atributos</p>
      <div className="g3" style={{ gap: 12 }}>
        {ATTRS.map(({ key, label, abbr }) => {
          const val = char.attributes[key];
          const mod = calcMod2(val);
          return (
            <div key={key} className="attr-box">
              <div className="attr-name">{abbr}</div>
              <input
                type="number"
                min={1}
                max={30}
                value={val}
                onChange={(e) => setAttr(key, Number(e.target.value))}
                style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, padding: '4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, width: '100%', marginBottom: 4 }}
              />
              <div className="attr-mod" style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
              <div className="attr-mod">
                {mod >= 0 ? '+' : ''}{mod}
              </div>
            </div>
          );
        })}
      </div>

      <hr className="div" style={{ marginTop: 20 }} />
      <p className="sec-title">Capacidade de Carga</p>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div>
          <span className="text-muted text-xs">Carga Máx. (Força × 5): </span>
          <strong className="text-gold">{char.attributes.strength * 5} kg</strong>
        </div>
        <div>
          <span className="text-muted text-xs">Peso Atual: </span>
          <strong style={{ color: (() => {
            const total = char.equipment.reduce((sum, i) => sum + i.weight, 0);
            return total > char.attributes.strength * 5 ? 'var(--danger)' : 'var(--text)';
          })() }}>
            {char.equipment.reduce((sum, i) => sum + i.weight, 0)} kg
          </strong>
        </div>
      </div>
    </div>
  );
}
