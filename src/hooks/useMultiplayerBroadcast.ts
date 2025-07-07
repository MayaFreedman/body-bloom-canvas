
import { useCallback, useRef } from 'react';
import { ServerClass } from '../services/ServerClass';
import { SensationData, BodyPartFill } from '@/types/multiplayerTypes';
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

  return {
    broadcastSensation,
    broadcastBodyPartFill,
    broadcastErase,
    broadcastUndo,
    broadcastRedo,
    broadcastReset,
    broadcastCursor,
    cleanup
  };
};
