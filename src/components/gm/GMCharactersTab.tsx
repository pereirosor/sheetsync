import { useState, useMemo } from 'react';
import { useStore } from '../../store';
import type { Character, GMCharacterFormData } from '../../types';
import CreateNPCModal from './CreateNPCModal';

type EditTarget = GMCharacterFormData & { originalName: string };

const ATTR_ABBR: { key: keyof Character['attributes']; abbr: string }[] = [
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

const buildFormData = (char: Character): EditTarget => ({
  originalName: char.name,
  name: char.name,
  npcType: (char.origin as 'NPC' | 'Monstro') ?? 'NPC',
  race: char.race,
  charClass: char.class,
  level: char.level,
  hpMax: char.vitals.hp.max,
  manaMax: char.vitals.mana.max,
  ac: char.vitals.ac,
  speed: char.speed,
  strength: char.attributes.strength,
  dexterity: char.attributes.dexterity,
  constitution: char.attributes.constitution,
  intelligence: char.attributes.intelligence,
  wisdom: char.attributes.wisdom,
  charisma: char.attributes.charisma,
  actions: char.actions ?? '',
  items: char.items ?? '',
});

export default function GMCharactersTab() {
  const campaign = useStore((s) => s.campaign);
  const characters = useStore((s) => s.characters);
  const createGMCharacter = useStore((s) => s.createGMCharacter);
  const updateGMCharacter = useStore((s) => s.updateGMCharacter);
  const deleteGMCharacter = useStore((s) => s.deleteGMCharacter);
  const toggleNPCInScene = useStore((s) => s.toggleNPCInScene);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRace, setFilterRace] = useState('');
  const [filterClass, setFilterClass] = useState('');

  if (!campaign) return null;

  const gmNames = campaign.gmCharacterNames ?? [];
  const gmChars = gmNames.map((n) => characters[n]).filter(Boolean) as Character[];

  const uniqueRaces = useMemo(
    () => [...new Set(gmChars.map((c) => c.race).filter(Boolean))].sort(),
    [gmChars],
  );
  const uniqueClasses = useMemo(
    () => [...new Set(gmChars.map((c) => c.class).filter(Boolean))].sort(),
    [gmChars],
  );

  const filtered = gmChars.filter((char) => {
    if (search && !char.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && char.origin !== filterType) return false;
    if (filterRace && char.race !== filterRace) return false;
    if (filterClass && char.class !== filterClass) return false;
    return true;
  });

  const hasFilters = search || filterType || filterRace || filterClass;

  const selectStyle = { fontSize: 12, padding: '4px 6px', minWidth: 90 };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <p className="sec-title" style={{ margin: 0 }}>
          Personagens do Mestre ({gmChars.length})
        </p>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Novo
        </button>
      </div>

      {/* Search + Filters */}
      {gmChars.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            style={{ flex: 1, minWidth: 120, fontSize: 12, padding: '4px 8px' }}
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
            <option value="">Tipo: Todos</option>
            <option value="NPC">NPC</option>
            <option value="Monstro">Monstro</option>
          </select>
          {uniqueRaces.length > 0 && (
            <select value={filterRace} onChange={(e) => setFilterRace(e.target.value)} style={selectStyle}>
              <option value="">Raça: Todas</option>
              {uniqueRaces.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          {uniqueClasses.length > 0 && (
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={selectStyle}>
              <option value="">Classe: Todas</option>
              {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {hasFilters && (
            <button
              className="btn-ghost btn-sm"
              onClick={() => { setSearch(''); setFilterType(''); setFilterRace(''); setFilterClass(''); }}
              style={{ fontSize: 11, color: 'var(--text2)' }}
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {gmChars.length === 0 && (
        <div className="empty-state">
          <h3 style={{ marginBottom: 8 }}>Nenhum personagem criado</h3>
          <p style={{ fontSize: 12 }}>
            Crie NPCs e Monstros para gerenciar durante a cena. Use o toggle "Na cena" para adicioná-los à Cena Atual.
          </p>
        </div>
      )}

      {gmChars.length > 0 && filtered.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', padding: '20px 0' }}>
          Nenhum personagem encontrado com esses filtros.
        </p>
      )}

      {/* Character list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((char) => (
          <div key={char.name} className="gm-card">
            <div className="gm-card-header">
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: 14, color: 'var(--gold)' }}>{char.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    {[char.origin, char.race, char.class].filter(Boolean).join(' · ')}
                    {` · Nível ${char.level}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      cursor: 'pointer', textTransform: 'none',
                      letterSpacing: 'normal', fontSize: 12,
                      color: char.inScene ? 'var(--gold)' : 'var(--text2)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={char.inScene}
                      onChange={() => toggleNPCInScene(char.name)}
                    />
                    Na cena
                  </label>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => setEditTarget(buildFormData(char))}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => {
                      if (confirm(`Excluir "${char.name}"? Esta ação não pode ser desfeita.`)) {
                        deleteGMCharacter(char.name);
                      }
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>

            <div className="gm-card-body" style={{ padding: '8px 16px' }}>
              {/* Vitals */}
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap', marginBottom: 10 }}>
                <span>
                  PV:{' '}
                  <strong style={{ color: 'var(--hp)' }}>
                    {char.vitals.hp.current}/{char.vitals.hp.max}
                  </strong>
                </span>
                {char.vitals.mana.max > 0 && (
                  <span>
                    Mana:{' '}
                    <strong style={{ color: 'var(--mana)' }}>
                      {char.vitals.mana.current}/{char.vitals.mana.max}
                    </strong>
                  </span>
                )}
                <span>
                  CA: <strong style={{ color: 'var(--gold)' }}>{char.vitals.ac}</strong>
                </span>
                <span>
                  Desl.: <strong>{char.speed}q</strong>
                </span>
              </div>

              {/* Attributes */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ATTR_ABBR.map(({ key, abbr }) => {
                  const val = char.attributes[key];
                  const bonus = attrBonus(val);
                  return (
                    <div key={key} style={{ textAlign: 'center', minWidth: 38 }}>
                      <div style={{ fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        {abbr}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', lineHeight: 1.2 }}>
                        {val}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>
                        {bonus}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              {char.actions && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>
                    Ações
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text1)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {char.actions}
                  </p>
                </div>
              )}

              {/* Items */}
              {char.items && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>
                    Itens Carregados
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text1)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {char.items}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateNPCModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createGMCharacter(data)}
        />
      )}
      {editTarget && (
        <CreateNPCModal
          initialValues={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(data, originalName) => updateGMCharacter(originalName!, data)}
        />
      )}
    </div>
  );
}
