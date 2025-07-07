
import { useRef, useCallback } from 'react';
import * as THREE from 'three';
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
  const localStrokePoints = useRef<WorldDrawingPoint[]>([]);

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
    console.log('🎨 Starting optimized drawing stroke with batching');
    currentStrokeMetadata.current = { color, size };
    localStrokePoints.current = [];
    optimizedProcessing.resetStroke();
  }, [optimizedProcessing]);

  const addToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    console.log('🎨 Adding point to local stroke batch:', worldPoint);
    
    // Add to local collection for batching
    localStrokePoints.current.push(worldPoint);
    
    // Also add to optimized processing for key point extraction
    const worldPosition = new THREE.Vector3(
      worldPoint.worldPosition.x,
      worldPoint.worldPosition.y,
      worldPoint.worldPosition.z
    );
    optimizedProcessing.addStrokePoint(worldPosition, worldPoint.bodyPart, worldPoint.whiteboardRegion);
  }, [optimizedProcessing]);

  const finishDrawingStroke = useCallback(() => {
    if (!currentStrokeMetadata.current) return;
    
    const { color, size } = currentStrokeMetadata.current;
    
    console.log('🎨 Finishing stroke with', localStrokePoints.current.length, 'local points');
    
    // Create optimized stroke from collected points
    const optimizedStroke = optimizedProcessing.finalizeStroke(color, size);
    
    if (optimizedStroke) {
      console.log('🎨 Broadcasting complete stroke with', optimizedStroke.keyPoints.length, 'key points');
      broadcastDrawingStroke(optimizedStroke);
    }
    
    // Reset for next stroke
    currentStrokeMetadata.current = null;
    localStrokePoints.current = [];
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
