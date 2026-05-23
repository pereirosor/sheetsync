import { useEffect } from 'react';
import { useStore } from './store';
import { useSync } from './hooks/useSync';
import AuthScreen from './components/auth/AuthScreen';
import Dashboard from './components/Dashboard';
import CharacterSheet from './components/sheet/CharacterSheet';
import CharacterCreationWizard from './components/creation/CharacterCreationWizard';
import GMPanel from './components/gm/GMPanel';
import ToastContainer from './components/ui/Toast';

export default function App() {
  useSync();

  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);
  const initAuth = useStore((s) => s.initAuth);
  const role = useStore((s) => s.role);
  const currentPlayerName = useStore((s) => s.currentPlayerName);
  const characters = useStore((s) => s.characters);
  const campaign = useStore((s) => s.campaign);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (authLoading) return null;

  const playerChar = role === 'player' && currentPlayerName ? characters[currentPlayerName] : null;

  return (
    <>
      {!user && <AuthScreen />}
      {user && !campaign && <Dashboard />}
      {user && campaign && role === 'gm' && <GMPanel />}
      {user && campaign && role === 'player' && (
        playerChar?.created ? <CharacterSheet /> : <CharacterCreationWizard />
      )}
      <ToastContainer />
    </>
  );
}
