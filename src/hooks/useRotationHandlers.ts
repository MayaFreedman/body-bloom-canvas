
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseRotationHandlersProps {
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  multiplayer: ReturnType<typeof useMultiplayer>;
}

export const useRotationHandlers = ({ setRotation, multiplayer }: UseRotationHandlersProps) => {
  const handleRotateLeft = useCallback(() => {
    setRotation(prev => prev - Math.PI / 2);
    
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'left' }
      });
    }
  }, [setRotation, multiplayer]);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => prev + Math.PI / 2);
    
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'right' }
      });
    }
  }, [setRotation, multiplayer]);

  return {
    handleRotateLeft,
    handleRotateRight
  };
};
