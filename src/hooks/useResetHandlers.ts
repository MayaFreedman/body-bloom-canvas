
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseResetHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  clearAll: () => void;
}

export const useResetHandlers = ({ multiplayer, clearAll }: UseResetHandlersProps) => {
  const handleResetAll = useCallback(() => {
    clearAll();
    
    if (multiplayer.isConnected) {
      multiplayer.broadcastReset();
    }
  }, [clearAll, multiplayer]);

  return {
    handleResetAll
  };
};
