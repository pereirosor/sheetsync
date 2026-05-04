import { useEffect } from 'react';
import { useStore } from '../store';

export function useSync() {
  const initChannel = useStore((s) => s.initChannel);

  useEffect(() => {
    initChannel();
  }, [initChannel]);
}
