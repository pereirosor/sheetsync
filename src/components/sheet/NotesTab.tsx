import { useStore } from '../../store';

interface Props {
  characterName: string;
}

export default function NotesTab({ characterName }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  return (
    <div>
      <p className="sec-title">Notas Gerais</p>
      <textarea
        value={char.notes}
        onChange={(e) => updateCharacter(characterName, { notes: e.target.value })}
        placeholder="Anote histórico, objetivos, relações, itens importantes, segredos do personagem..."
        style={{ minHeight: 320, width: '100%', fontSize: 14, lineHeight: 1.7 }}
      />
    </div>
  );
}
