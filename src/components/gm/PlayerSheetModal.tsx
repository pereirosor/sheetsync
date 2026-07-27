import CharacterSheet from '../sheet/CharacterSheet';

interface Props {
  characterName: string;
  onClose: () => void;
}

/**
 * Ficha completa de um personagem de jogador, aberta pelo Mestre em modo leitura.
 * Reaproveita o CharacterSheet do jogador (que já delega para o CoCSheet quando a
 * campanha é de Call of Cthulhu), em vez do NPCSheetModal — este último ignora
 * char.skills e só mostra os campos livres de NPC.
 */
export default function PlayerSheetModal({ characterName, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        zIndex: 600, overflowY: 'auto', padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card card-gold"
        style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: 0 }}
      >
        <div
          className="flex-between"
          style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 16, color: 'var(--gold)' }}>Ficha de {characterName}</h2>
            <span className="locked-badge">somente leitura</span>
          </div>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <CharacterSheet characterName={characterName} readOnly />
      </div>
    </div>
  );
}
