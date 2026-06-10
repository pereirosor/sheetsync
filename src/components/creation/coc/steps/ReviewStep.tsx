import {
  CHARACTERISTIC_DEFS,
  calcHP, calcMP, calcSAN, calcMOV, getDamageBonus,
} from '../../../../systems/coc7e/characteristics';
import { getOccupationById } from '../../../../systems/coc7e/occupations';
import { COC_SKILLS, calcSkillBase, getSkillDisplayName } from '../../../../systems/coc7e/skills';
import {
  financeFromCredit, formatMoney, getItemById, getWeaponById,
} from '../../../../systems/coc7e/equipment';
import { getWizardCredit, purchaseCost } from './EquipmentStep';
import type { CoCWizardState } from '../wizardState';

interface Props {
  state: CoCWizardState;
  characterName: string;
  era: '1920s' | 'modern';
}

const CHAR_ABBR: Record<string, string> = {
  strength: 'FOR', constitution: 'CON', size: 'TAM',
  dexterity: 'DES', appearance: 'APA', intelligence: 'INT',
  power: 'POD', education: 'EDU',
};

export default function ReviewStep({ state, characterName, era }: Props) {
  const ch = state.characteristics;
  const occ = getOccupationById(state.occupationId);
  const dex = ch.dexterity, edu = ch.education;

  const hp  = calcHP(ch.constitution, ch.size);
  const mp  = calcMP(ch.power);
  const san = calcSAN(ch.power);
  const mov = calcMOV(ch.strength, ch.dexterity, ch.size, state.age);
  const db  = getDamageBonus(ch.strength, ch.size);

  const raisedSkills = COC_SKILLS.filter(s => {
    const base = calcSkillBase(s, dex, edu);
    const val  = state.skillValues[s.id] ?? base;
    return val > base;
  });

  const credit  = getWizardCredit(state);
  const finance = financeFromCredit(credit, era);
  const cashRemaining = Math.max(0, finance.cash - purchaseCost(state.purchases, era));

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
        Revise seu investigador antes de finalizar.
      </p>

      {/* Identity */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
          Identidade
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Nome</span>
            <div style={{ fontWeight: 600 }}>{characterName}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Idade</span>
            <div style={{ fontWeight: 600 }}>{state.age}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Ocupação</span>
            <div style={{ fontWeight: 600 }}>{occ?.name ?? <span style={{ color: 'var(--danger)' }}>Não definida</span>}</div>
          </div>
        </div>
      </section>

      {/* Characteristics */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
          Características
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {CHARACTERISTIC_DEFS.map(def => (
            <div key={def.key} style={{
              padding: '6px 8px', borderRadius: 6, textAlign: 'center',
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{CHAR_ABBR[def.key]}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{ch[def.key]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Derived */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
          Atributos Derivados
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { label: 'PV', value: hp },
            { label: 'PM', value: mp },
            { label: 'SAN', value: san },
            { label: 'MOV', value: mov },
            { label: 'Bônus de Dano', value: db.damageBonus },
            { label: 'Construção', value: db.build },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '6px 8px', borderRadius: 6, textAlign: 'center',
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Equipment & money */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
          Equipamento e Dinheiro
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Dinheiro</span>
            <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{formatMoney(cashRemaining)}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Patrimônio</span>
            <div style={{ fontWeight: 600 }}>{formatMoney(finance.assets)}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Nível de Gastos</span>
            <div style={{ fontWeight: 600 }}>{formatMoney(finance.spendingLevel)}</div>
          </div>
        </div>
        {state.purchases.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {state.purchases.map(p => {
              const def = p.kind === 'weapon' ? getWeaponById(p.defId) : getItemById(p.defId);
              return (
                <span key={p.defId} className="wizard-tag">
                  {def?.name}{p.quantity > 1 ? ` x${p.quantity}` : ''}
                </span>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text2)' }}>Nenhum item comprado.</p>
        )}
      </section>

      {/* Raised skills */}
      {raisedSkills.length > 0 && (
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
            Perícias Aprimoradas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {raisedSkills.map(s => {
              const base = calcSkillBase(s, dex, edu);
              const val  = state.skillValues[s.id] ?? base;
              return (
                <div key={s.id} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)',
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text)' }}>{getSkillDisplayName(s)}</span>
                  <span style={{ color: 'var(--gold)', marginLeft: 4, fontWeight: 700 }}>{val}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
