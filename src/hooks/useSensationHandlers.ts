
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import * as THREE from 'three';

interface UseSensationHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
}

export const useSensationHandlers = ({ multiplayer }: UseSensationHandlersProps) => {
  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => {
    console.log('🔥 MULTIPLAYER SENSATION: Sensation clicked:', position, sensation);
    console.log('🔥 MULTIPLAYER SENSATION: Is connected?', multiplayer.isConnected);
    
    if (multiplayer.isConnected) {
      const sensationMark = {
        id: `sensation-${Date.now()}-${Math.random()}`,
        position,
        icon: sensation.icon,
        color: sensation.color,
        size: 0.1
      };
      multiplayer.broadcastSensation(sensationMark);
    }
  }, [multiplayer]);

  return {
    handleSensationClick
  };
};
