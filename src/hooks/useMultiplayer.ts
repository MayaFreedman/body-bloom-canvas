
import { useState, useEffect, useCallback, useRef } from 'react';
import { Room } from 'colyseus.js';
import { ServerClass } from '../services/ServerClass';
import * as THREE from 'three';

interface DrawingStroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  size: number;
  playerId: string;
}

interface SensationData {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
  playerId: string;
}

interface BodyPartFill {
  partName: string;
  color: string;
  playerId: string;
}

interface PlayerCursor {
  playerId: string;
  position: { x: number; y: number };
  color: string;
  name: string;
}

interface MultiplayerState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  players: Map<string, PlayerCursor>;
  currentPlayerId: string | null;
  playerColor: string;
}

export const useMultiplayer = (roomId: string | null) => {
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    isConnecting: false,
    room: null,
    players: new Map(),
    currentPlayerId: null,
    playerColor: '#ff6b6b'
  });

  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const drawingStrokeRef = useRef<THREE.Vector3[]>([]);

  const connectToRoom = useCallback(async (id: string) => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const server = ServerClass.getInstance();
      const room = await server.getClient().joinOrCreate('body_mapper', { roomId: id });
      
      const playerColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
      const playerColor = playerColors[Math.floor(Math.random() * playerColors.length)];

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        room,
        currentPlayerId: room.sessionId,
        playerColor
      }));

      // Setup message handlers
      room.onMessage('broadcast', (message: any) => {
        handleBroadcastMessage(message);
      });

      room.onMessage('player_joined', (player: PlayerCursor) => {
        setState(prev => ({
          ...prev,
          players: new Map(prev.players).set(player.playerId, player)
        }));
      });

      room.onMessage('player_left', (playerId: string) => {
        setState(prev => {
          const newPlayers = new Map(prev.players);
          newPlayers.delete(playerId);
          return { ...prev, players: newPlayers };
        });
      });

      room.onLeave(() => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          room: null,
          players: new Map()
        }));
      });

    } catch (error) {
      console.error('Failed to connect to room:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [state.isConnecting, state.isConnected]);

  const handleBroadcastMessage = useCallback((message: any) => {
    // Messages will be handled by the components that subscribe to them
    console.log('Received broadcast message:', message);
  }, []);

  const broadcastDrawingStroke = useCallback((stroke: Omit<DrawingStroke, 'playerId'>) => {
    if (state.room && state.isConnected) {
      state.room.send('broadcast', {
        type: 'drawingStroke',
        data: { ...stroke, playerId: state.currentPlayerId }
      });
    }
  }, [state.room, state.isConnected, state.currentPlayerId]);

  const broadcastSensation = useCallback((sensation: Omit<SensationData, 'playerId'>) => {
    if (state.room && state.isConnected) {
      state.room.send('broadcast', {
        type: 'sensationPlace',
        data: { ...sensation, playerId: state.currentPlayerId }
      });
    }
  }, [state.room, state.isConnected, state.currentPlayerId]);

  const broadcastBodyPartFill = useCallback((fill: Omit<BodyPartFill, 'playerId'>) => {
    if (state.room && state.isConnected) {
      state.room.send('broadcast', {
        type: 'bodyPartFill',
        data: { ...fill, playerId: state.currentPlayerId }
      });
    }
  }, [state.room, state.isConnected, state.currentPlayerId]);

  const broadcastCursor = useCallback((position: { x: number; y: number }) => {
    if (state.room && state.isConnected) {
      // Throttle cursor updates to 15fps
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
      
      cursorThrottleRef.current = setTimeout(() => {
        state.room?.send('broadcast', {
          type: 'playerCursor',
          data: {
            playerId: state.currentPlayerId,
            position,
            color: state.playerColor,
            name: `Player ${state.currentPlayerId?.slice(-4)}`
          }
        });
      }, 66); // ~15fps
    }
  }, [state.room, state.isConnected, state.currentPlayerId, state.playerColor]);

  const startDrawingStroke = useCallback(() => {
    drawingStrokeRef.current = [];
  }, []);

  const addToDrawingStroke = useCallback((point: THREE.Vector3) => {
    drawingStrokeRef.current.push(point.clone());
  }, []);

  const finishDrawingStroke = useCallback((color: string, size: number) => {
    if (drawingStrokeRef.current.length > 0) {
      const stroke: Omit<DrawingStroke, 'playerId'> = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: [...drawingStrokeRef.current],
        color,
        size
      };
      broadcastDrawingStroke(stroke);
      drawingStrokeRef.current = [];
    }
  }, [broadcastDrawingStroke]);

  useEffect(() => {
    if (roomId) {
      connectToRoom(roomId);
    }

    return () => {
      if (state.room) {
        state.room.leave();
      }
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
    };
  }, [roomId, connectToRoom]);

  return {
    ...state,
    connectToRoom,
    broadcastDrawingStroke,
    broadcastSensation,
    broadcastBodyPartFill,
    broadcastCursor,
    startDrawingStroke,
    addToDrawingStroke,
    finishDrawingStroke
  };
};
