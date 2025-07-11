
import { useCallback, useRef } from 'react';
import { ServerClass } from '../services/ServerClass';
import { SensationData, BodyPartFill } from '@/types/multiplayerTypes';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

export const useMultiplayerBroadcast = (
  room: any,
  isConnected: boolean,
  currentPlayerId: string | null,
  playerColor: string
) => {
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastSensation = useCallback((sensation: Omit<SensationData, 'playerId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'sensationPlace',
        action: { ...sensation, playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastBodyPartFill = useCallback((fill: Omit<BodyPartFill, 'playerId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'bodyPartFill',
        action: { ...fill, playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastErase = useCallback((center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'eraseAction',
        action: { 
          center: { x: center.x, y: center.y, z: center.z },
          radius,
          surface,
          playerId: currentPlayerId 
        }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastUndo = useCallback(() => {
    if (room && isConnected) {
      console.log('Broadcasting undo action');
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'undoAction',
        action: { playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastRedo = useCallback(() => {
    if (room && isConnected) {
      console.log('Broadcasting redo action');
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'redoAction',
        action: { playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastReset = useCallback(() => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'resetAll',
        action: { playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastTextPlace = useCallback((textMark: Omit<TextMark, 'userId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'textPlace',
        action: { 
          ...textMark, 
          userId: currentPlayerId,
          position: { x: textMark.position.x, y: textMark.position.y, z: textMark.position.z }
        }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastTextUpdate = useCallback((textMark: Partial<TextMark> & { id: string }) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'textUpdate',
        action: { 
          ...textMark, 
          userId: currentPlayerId,
          position: textMark.position ? { x: textMark.position.x, y: textMark.position.y, z: textMark.position.z } : undefined
        }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastTextDelete = useCallback((textId: string) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'textDelete',
        action: { 
          id: textId,
          userId: currentPlayerId
        }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const broadcastCursor = useCallback((position: { x: number; y: number }) => {
    if (room && isConnected) {
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
      
      cursorThrottleRef.current = setTimeout(() => {
        const server = ServerClass.getInstance();
        server.sendEvent({
          type: 'playerCursor',
          action: {
            playerId: currentPlayerId,
            position,
            color: playerColor,
            name: `Player ${currentPlayerId?.slice(-4)}`
          }
        });
      }, 66); // ~15fps
    }
  }, [room, isConnected, currentPlayerId, playerColor]);

  const cleanup = useCallback(() => {
    if (cursorThrottleRef.current) {
      clearTimeout(cursorThrottleRef.current);
    }
  }, []);

  // Broadcast custom effect creation
  const broadcastCustomEffect = useCallback((customEffect: {
    id: string;
    name: string;
    selectedIcon: string;
    color: string;
    movementBehavior: 'gentle' | 'moderate' | 'energetic';
    isCustom: true;
    createdAt: number;
  }) => {
    if (!isConnected || !room) {
      console.log('🔥 CUSTOM EFFECT BROADCAST: Not connected, skipping broadcast');
      return;
    }

    console.log('🔥 CUSTOM EFFECT BROADCAST: Broadcasting custom effect creation:', customEffect);
    
    try {
      room.send('broadcast', {
        type: 'customEffectCreate',
        data: {
          ...customEffect,
          playerId: currentPlayerId
        }
      });
      console.log('🔥 CUSTOM EFFECT BROADCAST: Successfully sent custom effect broadcast');
    } catch (error) {
      console.error('🔥 CUSTOM EFFECT BROADCAST: Failed to broadcast custom effect:', error);
    }
  }, [isConnected, room, currentPlayerId]);

  // Broadcast custom effect deletion
  const broadcastCustomEffectDelete = useCallback((effectId: string) => {
    if (!isConnected || !room) {
      console.log('🗑️ CUSTOM EFFECT DELETE BROADCAST: Not connected, skipping broadcast');
      return;
    }

    console.log('🗑️ CUSTOM EFFECT DELETE BROADCAST: Broadcasting custom effect deletion:', effectId);
    
    try {
      room.send('broadcast', {
        type: 'customEffectDelete',
        data: {
          effectId,
          playerId: currentPlayerId
        }
      });
      console.log('🗑️ CUSTOM EFFECT DELETE BROADCAST: Successfully sent custom effect delete broadcast');
    } catch (error) {
      console.error('🗑️ CUSTOM EFFECT DELETE BROADCAST: Failed to broadcast custom effect deletion:', error);
    }
  }, [isConnected, room, currentPlayerId]);

  return {
    broadcastSensation,
    broadcastBodyPartFill,
    broadcastErase,
    broadcastUndo,
    broadcastRedo,
    broadcastReset,
    broadcastCursor,
    broadcastTextPlace,
    broadcastTextUpdate,
    broadcastTextDelete,
    broadcastCustomEffect,
    broadcastCustomEffectDelete,
    cleanup
  };
};
