import tormenta20 from '../../../systems/tormenta20';
import type { AttributeKey } from '../../../types';
import { computeFinalAttributes, computeDerivedVitals, T20_ATTRS, type WizardState } from '../wizardState';

const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'For', dexterity: 'Des', constitution: 'Con',
  intelligence: 'Int', wisdom: 'Sab', charisma: 'Car',
  size: 'Tam', power: 'Pod', appearance: 'Apa', education: 'Edu',
};

function calcMod(v: number) { return Math.floor((v - 10) / 2); }
function modStr(v: number) { const m = calcMod(v); return m >= 0 ? `+${m}` : `${m}`; }

interface Props {
  state: WizardState;
  characterName: string;
}

export default function ReviewStep({ state, characterName }: Props) {
  const cd = tormenta20.classData[state.charClass];
  const magicType = tormenta20.classMagicType[state.charClass];

  const finals = computeFinalAttributes(state);
  const getTotal = (attr: (typeof T20_ATTRS)[number]) => finals[attr];

  const derived = computeDerivedVitals(state, 1);
  const hpMax = derived?.hpMax ?? 10;
  const manaMax = derived?.manaMax ?? 0;

  const allSkills = [
    ...(cd?.trainedSkills ?? []),
    ...state.skillChoices,
  ];
  const uniqueSkills = [...new Set(allSkills)];

  const AUTO_KIT = ['Mochila', 'Saco de Dormir', 'Traje de Viajante'];
  const allEquip = [
    ...AUTO_KIT,
    ...(state.weaponSimple ? [state.weaponSimple] : []),
    ...(state.weaponMartial ? [state.weaponMartial] : []),
    ...(state.armorPick ? [state.armorPick] : []),
    ...(state.shieldPick ? [state.shieldPick] : []),
    ...state.shoppedItems.map((i) => i.name),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="wizard-info-card">
        <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold)', marginBottom: 4 }}>{characterName}</p>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          {state.race} · {state.charClass}{state.classPath ? ` (${state.classPath})` : ''} · {state.origin}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
          PV: {hpMax} &nbsp;|&nbsp; Mana: {manaMax}/nível
        </p>
      </div>

      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Atributos Finais</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {T20_ATTRS.map((attr) => {
            const total = getTotal(attr);
            return (
              <div key={attr} style={{ textAlign: 'center', padding: '6px 10px', background: 'var(--bg-card2)', borderRadius: 6, minWidth: 56 }}>
                <p style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>{ATTR_LABELS[attr]}</p>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{total}</p>
                <p style={{ fontSize: 10, color: 'var(--text2)' }}>{modStr(total)}</p>
              </div>
            );
          })}
        </div>
        {state.attributeMethod === 'manual' && (
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8, fontStyle: 'italic' }}>
            Valores inseridos manualmente — os modificadores raciais já estão inclusos.
          </p>
        )}
      </div>

      {uniqueSkills.length > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Perícias Treinadas</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {uniqueSkills.map((id) => {
              const sk = tormenta20.skillList.find((s) => s.id === id);
              return <span key={id} className="wizard-tag">{sk?.name ?? id}</span>;
            })}
          </div>
        </div>
      )}

      <div className="wizard-info-card">
        <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Equipamentos</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allEquip.map((item, i) => (
            <span key={i} className="wizard-tag">{item}</span>
          ))}
        </div>
        {state.startingMoney > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
            T$ restantes: {state.startingMoney - state.shoppedItems.reduce((s, i) => s + i.price, 0)}
          </p>
        )}
      </div>

      {magicType && state.spellsPicked.length > 0 && (
        <div className="wizard-info-card">
          <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Magias</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {state.spellsPicked.map((name) => (
              <span key={name} className="wizard-tag">{name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="wizard-info-card" style={{ borderColor: 'var(--gold)', border: '1px solid var(--gold)' }}>
        <p style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
          Após finalizar, as escolhas de raça, classe, origem, atributos e perícias treinadas ficarão permanentemente definidas.
        </p>
      </div>
    </div>
  );
}
