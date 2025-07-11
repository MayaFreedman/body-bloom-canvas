import { useCallback } from 'react';
import { useMultiplayerBroadcast } from './useMultiplayerBroadcast';

interface StateSnapshotData {
  drawingStrokes: any[];
  sensationMarks: any[];
  bodyPartColors: Record<string, string>;
  textMarks: any[];
  whiteboardBackground: string;
  modelRotation: number;
  emotions: any[];
}

interface StateSnapshot {
  type: 'stateSnapshot';
  data: StateSnapshotData;
  playerId: string;
  timestamp: number;
  version: string;
}

interface UseStateSnapshotProps {
  currentUserId: string | null;
  drawingStrokes: any[];
  sensationMarks: any[];
  bodyPartColors: Record<string, string>;
  textMarks: any[];
  whiteboardBackground: string;
  rotation: number;
  emotions: any[];
  multiplayer: any;
  onRestoreState?: (snapshot: StateSnapshot) => void;
}

export const useStateSnapshot = ({
  currentUserId,
  drawingStrokes,
  sensationMarks,
  bodyPartColors,
  textMarks,
  whiteboardBackground,
  rotation,
  emotions,
  multiplayer,
  onRestoreState
}: UseStateSnapshotProps) => {

  const broadcastStateSnapshot = useCallback(() => {
    if (!multiplayer.isConnected || !currentUserId) return;

    const snapshot: StateSnapshot = {
      type: 'stateSnapshot',
      data: {
        drawingStrokes: [...drawingStrokes],
        sensationMarks: [...sensationMarks],
        bodyPartColors: { ...bodyPartColors },
        textMarks: [...textMarks],
        whiteboardBackground,
        modelRotation: rotation,
        emotions: [...emotions]
      },
      playerId: currentUserId,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    console.log('📸 Broadcasting state snapshot:', snapshot);
    multiplayer.room?.send('broadcast', snapshot);
  }, [currentUserId, drawingStrokes, sensationMarks, bodyPartColors, textMarks, whiteboardBackground, rotation, emotions, multiplayer]);

  const requestStateSnapshot = useCallback(() => {
    if (!multiplayer.isConnected || !currentUserId) return;

    const request = {
      type: 'requestState',
      playerId: currentUserId,
      timestamp: Date.now()
    };

    console.log('📞 Requesting state snapshot:', request);
    multiplayer.room?.send('broadcast', request);
  }, [currentUserId, multiplayer]);

  const restoreFromSnapshot = useCallback((snapshot: StateSnapshot) => {
    console.log('🔄 Restoring state from snapshot:', snapshot);
    if (onRestoreState) {
      onRestoreState(snapshot);
    }
  }, [onRestoreState]);

  return {
    broadcastStateSnapshot,
    requestStateSnapshot,
    restoreFromSnapshot
  };
};