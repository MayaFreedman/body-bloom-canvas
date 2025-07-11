
import { useState, useCallback } from 'react';
import { Room } from 'colyseus.js';
import { ServerClass } from '../services/ServerClass';
import { MultiplayerState, PlayerCursor } from '@/types/multiplayerTypes';

export const useMultiplayerConnection = () => {
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    isConnecting: false,
    room: null,
    players: new Map(),
    currentPlayerId: null,
    playerColor: '#ff6b6b',
    joinedAt: null
  });

  const connectToRoom = useCallback(async (id: string) => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const server = ServerClass.getInstance();
      const room = await server.connectToColyseusServer(id, false) as Room;
      
      const playerColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
      const playerColor = playerColors[Math.floor(Math.random() * playerColors.length)];

      const joinedAt = Date.now();
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        room,
        currentPlayerId: room.sessionId,
        playerColor,
        joinedAt
      }));

      // Setup player management handlers
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

      // Request state snapshot after successful connection
      setTimeout(() => {
        console.log('📸 Requesting state snapshot after room join');
        console.log('📡 Room connection status:', {
          isConnected: room.connection?.isOpen,
          sessionId: room.sessionId,
          roomId: room.id
        });
        
        try {
          room.send('broadcast', {
            type: 'stateRequest',
            data: {
              playerId: room.sessionId,
              timestamp: Date.now()
            }
          });
          console.log('✅ State request sent successfully');
        } catch (error) {
          console.error('❌ Failed to send state request:', error);
        }
      }, 1000); // Small delay to ensure other players are ready

      return room;
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  }, [state.isConnecting, state.isConnected]);

  return {
    ...state,
    connectToRoom,
    setState
  };
};
