import { useEffect } from 'react';
import { useStore } from './store';
import { useSync } from './hooks/useSync';
import HomePage from './components/HomePage';
import CharacterSheet from './components/sheet/CharacterSheet';
import GMPanel from './components/gm/GMPanel';
import ToastContainer from './components/ui/Toast';

export default function App() {
  useSync();

  const role = useStore((s) => s.role);
  const loading = useStore((s) => s.loading);
  const restoreSession = useStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  if (loading) return null;

  return (
    <>
      {role === null && <HomePage />}
      {role === 'gm' && <GMPanel />}
      {role === 'player' && <CharacterSheet />}
      <ToastContainer />
    </>
  );
}
