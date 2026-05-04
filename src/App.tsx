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
  const restoreSession = useStore((s) => s.restoreSession);
  const initChannel = useStore((s) => s.initChannel);

  useEffect(() => {
    const restored = restoreSession();
    if (restored) initChannel();
  }, [restoreSession, initChannel]);

  return (
    <>
      {role === null && <HomePage />}
      {role === 'gm' && <GMPanel />}
      {role === 'player' && <CharacterSheet />}
      <ToastContainer />
    </>
  );
}
