import { useState } from 'react';
import { useStore } from '../store';

export type CampaignView = 'home' | 'join';

export function useCampaign() {
  const [view, setView] = useState<CampaignView>('home');
  const [code, setCode] = useState('');
  const [charName, setCharName] = useState('');
  const [error, setError] = useState('');

  const createCampaign = useStore((s) => s.createCampaign);
  const confirmGMEntry = useStore((s) => s.confirmGMEntry);
  const joinCampaign = useStore((s) => s.joinCampaign);
  const initChannel = useStore((s) => s.initChannel);
  const pendingGMCode = useStore((s) => s.pendingGMCode);

  const handleCreate = () => {
    initChannel();
    createCampaign();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = charName.trim();
    if (!trimmedCode || !trimmedName) {
      setError('Preencha o código da campanha e o nome do personagem.');
      return;
    }
    initChannel();
    const result = joinCampaign(trimmedCode, trimmedName);
    if (result === 'not_found') {
      setError('Campanha não encontrada. Verifique o código e tente novamente.');
    }
  };

  const goToJoin = () => {
    setView('join');
    setError('');
  };

  const goHome = () => {
    setView('home');
    setError('');
  };

  return {
    view,
    code,
    setCode: (v: string) => { setCode(v); setError(''); },
    charName,
    setCharName: (v: string) => { setCharName(v); setError(''); },
    error,
    pendingGMCode,
    handleCreate,
    handleJoin,
    confirmGMEntry,
    goToJoin,
    goHome,
  };
}
