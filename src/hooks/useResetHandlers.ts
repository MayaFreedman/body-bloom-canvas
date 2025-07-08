
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseResetHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  clearAll: () => void;
  setSelectedSensation?: (sensation: any) => void;
}

export const useResetHandlers = ({ multiplayer, clearAll, setSelectedSensation }: UseResetHandlersProps) => {
  const handleResetAll = useCallback(() => {
    clearAll();
    
    // Also reset selected sensation if provided
    if (setSelectedSensation) {
      setSelectedSensation(null);
    }
    
    if (multiplayer.isConnected) {
      multiplayer.broadcastReset();
    }
  }, [clearAll, setSelectedSensation, multiplayer]);

  return {
    handleResetAll
  };
};
