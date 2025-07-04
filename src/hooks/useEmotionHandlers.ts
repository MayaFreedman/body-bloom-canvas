
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseEmotionHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
}

export const useEmotionHandlers = ({ multiplayer }: UseEmotionHandlersProps) => {
  const handleEmotionsUpdate = useCallback((updateData: any) => {
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'emotionUpdate',
        data: updateData
      });
    }
  }, [multiplayer]);

  return {
    handleEmotionsUpdate
  };
};
