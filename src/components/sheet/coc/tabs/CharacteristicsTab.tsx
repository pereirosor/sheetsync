import {
  CHARACTERISTIC_DEFS,
  calcHP, calcMP, calcSAN, calcMOV, getDamageBonus,
} from '../../../../systems/coc7e/characteristics';
import type { Character } from '../../../../types';

interface Props {
  char: Character;
}

const CHAR_ABBR: Record<string, string> = {
  strength: 'FOR', constitution: 'CON', size: 'TAM',
  dexterity: 'DES', appearance: 'APA', intelligence: 'INT',
  power: 'POD', education: 'EDU',
};

export default function CharacteristicsTab({ char }: Props) {
  const a = char.attributes;
  const age = 25; // TODO: store age in character

  const hp  = calcHP(a.constitution, a.size);
  const mp  = calcMP(a.power);
  const san = calcSAN(a.power);
  const mov = calcMOV(a.strength, a.dexterity, a.size, age);
  const db  = getDamageBonus(a.strength, a.size);

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Characteristics grid */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Características
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 20 }}>
        {CHARACTERISTIC_DEFS.map(def => {
          const val = (a as unknown as Record<string, number>)[def.key] ?? 0;
          const halfVal = Math.floor(val / 2);
          const fifthVal = Math.floor(val / 5);
          return (
            <div key={def.key} style={{
              padding: '8px 10px', borderRadius: 8,
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>{CHAR_ABBR[def.key]}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>
                ½ {halfVal} · ⅕ {fifthVal}
              </div>
            </div>
          );
        })}
      </div>

      {/* Derived stats */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Atributos Derivados
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[
          { label: 'Pontos de Vida', value: `${char.vitals.hp.current} / ${hp}`, note: '' },
          { label: 'Pontos de Magia', value: `${char.vitals.mana.current} / ${mp}`, note: '' },
          { label: 'Sanidade', value: `${char.vitals.sanity.current} / ${san}`, note: '' },
          { label: 'Movimento', value: mov, note: 'quadrados/turno' },
          { label: 'Bônus de Dano', value: db.damageBonus, note: '' },
          { label: 'Construção', value: db.build, note: '' },
        ].map(({ label, value, note }) => (
          <div key={label} style={{
            padding: '8px 10px', borderRadius: 8, textAlign: 'center',
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{value}</div>
            {note && <div style={{ fontSize: 9, color: 'var(--text3)' }}>{note}</div>}
          </div>
        ))}
      </div>

      {/* Occupation / identity info */}
      <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Ocupação</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{char.class || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Movimento</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{mov} quadrados</div>
          </div>
        </div>
      </div>
    </div>
  );
}
