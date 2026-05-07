import { useEffect } from 'react';
import { useStore } from '../store';

export function useSync() {
  const initChannel = useStore((s) => s.initChannel);
  const campaignCode = useStore((s) => s.campaign?.code ?? null);

  useEffect(() => {
    if (campaignCode) initChannel(campaignCode);
  }, [campaignCode, initChannel]);
}
