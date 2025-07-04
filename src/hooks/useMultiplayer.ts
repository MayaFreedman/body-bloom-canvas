
import { useEffect, useCallback } from 'react';
import { useMultiplayerConnection } from './useMultiplayerConnection';
import { useMultiplayerDrawing } from './useMultiplayerDrawing';
import { useMultiplayerBroadcast } from './useMultiplayerBroadcast';

export const useMultiplayer = (roomId: string | null) => {
  const connection = useMultiplayerConnection();
  const drawing = useMultiplayerDrawing(connection.room, connection.isConnected, connection.currentPlayerId);
  const broadcast = useMultiplayerBroadcast(connection.room, connection.isConnected, connection.currentPlayerId, connection.playerColor);

  const handleBroadcastMessage = useCallback((message: any) => {
    console.log('Received broadcast message:', message);
  }, []);

  useEffect(() => {
    if (roomId && !connection.isConnected && !connection.isConnecting) {
      connection.connectToRoom(roomId).then(room => {
        if (room) {
          // Setup message handlers
          room.onMessage('broadcast', handleBroadcastMessage);
        }
      }).catch(error => {
        console.error('Failed to connect to room:', error);
      });
    }

    return () => {
      if (connection.room && connection.isConnected) {
        connection.room.leave();
      }
      broadcast.cleanup();
    };
  }, [roomId, connection.isConnected, connection.isConnecting, connection.connectToRoom, handleBroadcastMessage, broadcast.cleanup, connection.room]);

  return {
    ...connection,
    ...drawing,
    ...broadcast
  };
};
