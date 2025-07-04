
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';

interface UseRotationHandlersProps {
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  multiplayer: ReturnType<typeof useMultiplayer>;
}

export const useRotationHandlers = ({ rotation, setRotation, multiplayer }: UseRotationHandlersProps) => {
  const handleRotateLeft = useCallback(() => {
    setRotation(prev => prev - Math.PI / 2);
    
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'left' }
      });
    }
  }, [setRotation, multiplayer.isConnected, multiplayer.room]);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => prev + Math.PI / 2);
    
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'right' }
      });
    }
  }, [setRotation, multiplayer.isConnected, multiplayer.room]);

  return {
    handleRotateLeft,
    handleRotateRight
  };
};
