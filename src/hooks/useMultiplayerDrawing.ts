
import { useRef, useCallback } from 'react';
import { ServerClass } from '../services/ServerClass';
import { SurfaceDrawingPoint } from '@/utils/surfaceCoordinates';
import { DrawingStroke } from '@/types/multiplayerTypes';

export const useMultiplayerDrawing = (
  room: any,
  isConnected: boolean,
  currentPlayerId: string | null
) => {
  const drawingStrokeRef = useRef<SurfaceDrawingPoint[]>([]);

  const broadcastDrawingStroke = useCallback((stroke: Omit<DrawingStroke, 'playerId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'drawingStroke',
        action: { ...stroke, playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const startDrawingStroke = useCallback(() => {
    console.log('🎨 Starting drawing stroke');
    drawingStrokeRef.current = [];
  }, []);

  const addToDrawingStroke = useCallback((surfacePoint: SurfaceDrawingPoint) => {
    console.log('🎨 Adding surface point to stroke:', surfacePoint);
    drawingStrokeRef.current.push(surfacePoint);
  }, []);

  const finishDrawingStroke = useCallback(() => {
    if (drawingStrokeRef.current.length > 0) {
      console.log('🎨 Finishing stroke with', drawingStrokeRef.current.length, 'surface points');
      const stroke: Omit<DrawingStroke, 'playerId'> = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: [...drawingStrokeRef.current]
      };
      broadcastDrawingStroke(stroke);
      drawingStrokeRef.current = [];
    }
  }, [broadcastDrawingStroke]);

  return {
    startDrawingStroke,
    addToDrawingStroke,
    finishDrawingStroke,
    broadcastDrawingStroke
  };
};
