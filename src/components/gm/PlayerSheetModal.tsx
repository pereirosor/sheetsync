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
 *
 * O overlay NÃO rola: o CharacterSheet é um shell de viewport inteira e cuida do
 * próprio scroll interno. Deixar os dois rolando fazia o header sticky da ficha
 * clipar por cima do cabeçalho do modal (ver .sheet-embedded no index.css).
 */
export default function PlayerSheetModal({ characterName, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        zIndex: 600, padding: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card card-gold"
        style={{
          maxWidth: 1200, width: '100%', height: '100%',
          padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div
          className="flex-between"
          style={{
            flex: '0 0 auto',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 16, color: 'var(--gold)' }}>Ficha de {characterName}</h2>
            <span className="locked-badge">somente leitura</span>
          </div>
          <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="sheet-embedded">
          <CharacterSheet characterName={characterName} readOnly />
        </div>
      </div>
    </div>
  );
}
