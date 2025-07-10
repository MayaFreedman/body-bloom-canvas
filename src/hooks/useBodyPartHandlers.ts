
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseBodyPartHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  baseHandleBodyPartClick: (partName: string, color: string) => void;
}

export const useBodyPartHandlers = ({
  multiplayer,
  baseHandleBodyPartClick
}: UseBodyPartHandlersProps) => {
  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    baseHandleBodyPartClick(partName, color);
    
    if (multiplayer.isConnected) {
      multiplayer.broadcastBodyPartFill({ partName, color });
    }
  }, [baseHandleBodyPartClick, multiplayer]);

  const handleIncomingBodyPartFill = useCallback((partName: string, color: string) => {
    
    baseHandleBodyPartClick(partName, color);
  }, [baseHandleBodyPartClick]);

  return {
    handleBodyPartClick,
    handleIncomingBodyPartFill
  };
};
