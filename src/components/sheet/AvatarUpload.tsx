import { useRef } from 'react';
import { useStore } from '../../store';

interface Props {
  characterName: string;
  fallbackInitial: string;
  readOnly?: boolean;
}

export default function AvatarUpload({ characterName, fallbackInitial, readOnly }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarDataUrl = useStore((s) => s.characters[characterName]?.avatarDataUrl);
  const updateCharacter = useStore((s) => s.updateCharacter);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCharacter(characterName, { avatarDataUrl: reader.result as string } as never);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className="char-avatar"
      style={readOnly ? { cursor: 'default' } : undefined}
      onClick={() => { if (!readOnly) inputRef.current?.click(); }}
    >
      {avatarDataUrl ? (
        <img src={avatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        fallbackInitial
      )}
      {!readOnly && <div className="char-avatar-overlay">📷</div>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}
