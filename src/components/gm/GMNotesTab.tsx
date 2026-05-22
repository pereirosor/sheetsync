import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import type { GMNote } from '../../types';

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function GMNotesTab() {
  const gmNotes = useStore((s) => s.gmNotes);
  const createGMNote = useStore((s) => s.createGMNote);
  const updateGMNote = useStore((s) => s.updateGMNote);
  const deleteGMNote = useStore((s) => s.deleteGMNote);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return gmNotes.length > 0 ? gmNotes[gmNotes.length - 1].id : null;
  });

  // Keep selectedId valid when notes list changes externally
  useEffect(() => {
    if (selectedId && !gmNotes.find((n) => n.id === selectedId)) {
      setSelectedId(gmNotes.length > 0 ? gmNotes[gmNotes.length - 1].id : null);
    }
    if (!selectedId && gmNotes.length > 0) {
      setSelectedId(gmNotes[gmNotes.length - 1].id);
    }
  }, [gmNotes]);

  const selectedNote: GMNote | null = gmNotes.find((n) => n.id === selectedId) ?? null;

  const [localTitle, setLocalTitle] = useState('');
  const [localBody, setLocalBody] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const titleRef = useRef('');
  const bodyRef = useRef('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync editor when selected note changes
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    const title = selectedNote?.title ?? '';
    const body = selectedNote?.body ?? '';
    setLocalTitle(title);
    setLocalBody(body);
    titleRef.current = title;
    bodyRef.current = body;
    setSaveStatus('idle');
  }, [selectedId]);

  function scheduleSave(id: string) {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await updateGMNote(id, { title: titleRef.current, body: bodyRef.current });
      setSaveStatus('saved');
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  }

  function handleTitleChange(value: string) {
    setLocalTitle(value);
    titleRef.current = value;
    if (selectedId) scheduleSave(selectedId);
  }

  function handleBodyChange(value: string) {
    setLocalBody(value);
    bodyRef.current = value;
    if (selectedId) scheduleSave(selectedId);
  }

  function handleCreate() {
    const note = createGMNote();
    setSelectedId(note.id);
  }

  function handleDelete(id: string) {
    const newId = deleteGMNote(id);
    setSelectedId(newId);
  }

  return (
    <div className="gm-notes-layout">
      {/* Sidebar */}
      <div className="gm-notes-sidebar">
        <div className="gm-notes-sidebar-header">
          <span className="sec-title" style={{ margin: 0, border: 'none', padding: 0 }}>Notas</span>
          <button className="btn btn-secondary btn-xs" onClick={handleCreate}>
            + Nova
          </button>
        </div>

        <div className="gm-notes-list">
          {gmNotes.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: 12, padding: '8px 4px' }}>
              Sem notas ainda.
            </p>
          ) : (
            gmNotes.map((note) => (
              <div
                key={note.id}
                className={`gm-notes-item ${note.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(note.id)}
              >
                <span className="gm-notes-item-title">
                  {note.title.trim() || 'Sem título'}
                </span>
                <button
                  className="gm-notes-item-del"
                  title="Excluir nota"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="gm-notes-editor">
        {selectedNote ? (
          <>
            <div className="gm-notes-editor-topbar">
              <input
                type="text"
                className="gm-notes-title-input"
                placeholder="Título da nota"
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <span className={`gm-save-indicator ${saveStatus}`}>
                {saveStatus === 'saving' && '● Salvando...'}
                {saveStatus === 'saved' && '✓ Salvo'}
              </span>
            </div>
            <textarea
              className="gm-notes-body"
              placeholder="Escreva aqui..."
              value={localBody}
              onChange={(e) => handleBodyChange(e.target.value)}
            />
          </>
        ) : (
          <div className="empty-state">
            <h3>Sem nota selecionada</h3>
            <p style={{ marginBottom: 16 }}>Crie uma nota para começar.</p>
            <button className="btn btn-secondary btn-sm" onClick={handleCreate}>
              + Nova nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
