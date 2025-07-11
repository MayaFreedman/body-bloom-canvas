
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import * as THREE from 'three';

interface UseSensationHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
}

export const useSensationHandlers = ({ multiplayer }: UseSensationHandlersProps) => {
  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { 
    icon: string; 
    color: string; 
    name: string;
    movementBehavior?: 'gentle' | 'moderate' | 'energetic';
    isCustom?: boolean;
  }) => {
    console.log('🔥 MULTIPLAYER SENSATION: Sensation clicked:', position, sensation);
    console.log('🔥 MULTIPLAYER SENSATION: Is connected?', multiplayer.isConnected);
    
    if (multiplayer.isConnected) {
      const sensationMark = {
        id: `sensation-${Date.now()}-${Math.random()}`,
        position,
        icon: sensation.icon,
        color: sensation.color,
        name: sensation.name, // Include the name to determine particle image
        size: 0.1,
        movementBehavior: sensation.movementBehavior,
        isCustom: sensation.isCustom
      };
      console.log('🔥 SENSATION HANDLER: Creating sensation mark with icon:', sensation.icon, 'full sensation:', sensation);
      console.log('🔥 SENSATION HANDLER: Final sensation mark:', sensationMark);
      multiplayer.broadcastSensation(sensationMark);
    }
  }, [multiplayer]);

  return {
    handleSensationClick
  };
};
