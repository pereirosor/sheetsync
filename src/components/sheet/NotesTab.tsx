import { useStore } from '../../store';

interface Props {
  characterName: string;
  readOnly?: boolean;
}

export default function NotesTab({ characterName, readOnly }: Props) {
  const char = useStore((s) => s.characters[characterName]);
  const updateCharacter = useStore((s) => s.updateCharacter);

  if (!char) return null;

  return (
    <div>
      <p className="sec-title">Notas Gerais</p>
      <textarea
        value={char.notes}
        readOnly={readOnly}
        onChange={(e) => {
          if (readOnly) return;
          updateCharacter(characterName, { notes: e.target.value });
        }}
        placeholder="Anote histórico, objetivos, relações, itens importantes, segredos do personagem..."
        style={{ minHeight: 320, width: '100%', fontSize: 14, lineHeight: 1.7 }}
      />
    </div>
  );
}
