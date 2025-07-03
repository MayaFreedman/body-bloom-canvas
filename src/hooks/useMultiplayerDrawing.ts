
import { useRef, useCallback } from 'react';
import { ServerClass } from '../services/ServerClass';
import { WorldDrawingPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import { useOptimizedStrokeProcessing } from './useOptimizedStrokeProcessing';

export const useMultiplayerDrawing = (
  room: any,
  isConnected: boolean,
  currentPlayerId: string | null
) => {
  const optimizedProcessing = useOptimizedStrokeProcessing();
  const currentStrokeMetadata = useRef<{ color: string; size: number } | null>(null);

  const broadcastDrawingStroke = useCallback((stroke: Omit<OptimizedDrawingStroke, 'playerId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'optimizedDrawingStroke',
        action: { ...stroke, playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  const startDrawingStroke = useCallback((color: string, size: number) => {
    console.log('🎨 Starting optimized drawing stroke');
    currentStrokeMetadata.current = { color, size };
    optimizedProcessing.resetStroke();
  }, [optimizedProcessing]);

  const addToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    console.log('🎨 Adding key point to optimized stroke:', worldPoint);
    const worldPosition = new THREE.Vector3(
      worldPoint.worldPosition.x,
      worldPoint.worldPosition.y,
      worldPoint.worldPosition.z
    );
    optimizedProcessing.addStrokePoint(worldPosition, worldPoint.bodyPart);
  }, [optimizedProcessing]);

  const finishDrawingStroke = useCallback(() => {
    if (!currentStrokeMetadata.current) return;
    
    const { color, size } = currentStrokeMetadata.current;
    const optimizedStroke = optimizedProcessing.finalizeStroke(color, size);
    
    if (optimizedStroke) {
      console.log('🎨 Finishing optimized stroke with', optimizedStroke.keyPoints.length, 'key points');
      broadcastDrawingStroke(optimizedStroke);
    }
    
    currentStrokeMetadata.current = null;
  }, [optimizedProcessing, broadcastDrawingStroke]);

  // Legacy support for existing DrawingStroke format
  const broadcastLegacyDrawingStroke = useCallback((stroke: Omit<{ id: string; points: WorldDrawingPoint[] }, 'playerId'>) => {
    if (room && isConnected) {
      const server = ServerClass.getInstance();
      server.sendEvent({
        type: 'drawingStroke',
        action: { ...stroke, playerId: currentPlayerId }
      });
    }
  }, [room, isConnected, currentPlayerId]);

  return {
    startDrawingStroke,
    addToDrawingStroke,
    finishDrawingStroke,
    broadcastDrawingStroke,
    broadcastLegacyDrawingStroke,
    reconstructStroke: optimizedProcessing.reconstructStroke
  };
};
