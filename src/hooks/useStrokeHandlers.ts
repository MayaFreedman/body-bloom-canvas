
import { useCallback, useRef } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { DrawingMark } from '@/types/actionHistoryTypes';
import { WorldDrawingPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface UseStrokeHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  handleStartDrawing: () => void;
  handleFinishDrawing: () => void;
  restoreStroke: (stroke: any) => void;
  modelRef: React.RefObject<THREE.Group>;
  selectedColor: string;
  brushSize: number[];
  addAction: (action: any) => void;
}

export const useStrokeHandlers = ({
  multiplayer,
  handleStartDrawing,
  handleFinishDrawing,
  restoreStroke,
  modelRef,
  selectedColor,
  brushSize,
  addAction
}: UseStrokeHandlersProps) => {
  const processedStrokes = useRef(new Set<string>());

  const handleIncomingOptimizedStroke = useCallback((optimizedStroke: OptimizedDrawingStroke) => {
    // Prevent duplicate processing with better key
    const strokeKey = `${optimizedStroke.id}-${optimizedStroke.playerId}`;
    if (processedStrokes.current.has(strokeKey)) {
      return;
    }
    
    processedStrokes.current.add(strokeKey);
    
    try {
      const modelGroup = modelRef.current;
      if (!modelGroup || !optimizedStroke?.keyPoints?.length) {
        return;
      }

      const reconstructedPoints = multiplayer.reconstructStroke(optimizedStroke);
      
      if (reconstructedPoints.length === 0) {
        return;
      }

      const marks: DrawingMark[] = reconstructedPoints.map((worldPos, index) => {
        const localPos = new THREE.Vector3();
        modelGroup.worldToLocal(localPos.copy(worldPos));
        
        return {
          id: `reconstructed-${optimizedStroke.id}-${index}`,
          position: localPos,
          color: optimizedStroke.metadata.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, optimizedStroke.metadata.size / 200)),
          strokeId: optimizedStroke.id,
          timestamp: Date.now() + index,
          userId: optimizedStroke.playerId || 'unknown'
        };
      });

      const completeStroke = {
        id: optimizedStroke.id,
        marks: marks,
        startTime: optimizedStroke.metadata.startTime || Date.now() - 1000,
        endTime: optimizedStroke.metadata.endTime || Date.now(),
        brushSize: Math.max(1, Math.min(20, optimizedStroke.metadata.size || 3)),
        color: optimizedStroke.metadata.color || '#ff6b6b',
        isComplete: true,
        userId: optimizedStroke.playerId || 'unknown'
      };
      
      addAction({
        type: 'draw',
        data: {
          strokes: [completeStroke]
        },
        metadata: {
          brushSize: completeStroke.brushSize,
          color: completeStroke.color,
          isMultiplayer: true,
          playerId: optimizedStroke.playerId
        }
      });
      
    } catch (error) {
      console.error('❌ Error processing optimized stroke:', error);
    }
  }, [modelRef, multiplayer, addAction]);

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    const strokeKey = `${stroke.id}-${stroke.playerId}`;
    if (processedStrokes.current.has(strokeKey)) {
      return;
    }
    
    processedStrokes.current.add(strokeKey);
    
    try {
      if (!stroke?.points?.length) {
        return;
      }
      
      const modelGroup = modelRef.current;
      if (!modelGroup) {
        return;
      }

      const marks: DrawingMark[] = [];
      
      for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint: WorldDrawingPoint = stroke.points[i];
        
        if (!currentPoint?.worldPosition) {
          continue;
        }

        const worldPos = new THREE.Vector3(
          currentPoint.worldPosition.x || 0,
          currentPoint.worldPosition.y || 0,
          currentPoint.worldPosition.z || 0
        );
        
        const localPos = new THREE.Vector3();
        modelGroup.worldToLocal(localPos.copy(worldPos));
        
        const mark: DrawingMark = {
          id: currentPoint.id || `legacy-${i}`,
          position: localPos,
          color: currentPoint.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
          strokeId: stroke.id,
          timestamp: Date.now() + i,
          userId: stroke.playerId || 'unknown'
        };
        
        marks.push(mark);
      }
      
      if (marks.length === 0) {
        return;
      }

      const completeStroke = {
        id: stroke.id,
        marks: marks,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        brushSize: Math.max(1, Math.min(20, stroke.points[0]?.size || 3)),
        color: stroke.points[0]?.color || '#ff6b6b',
        isComplete: true,
        userId: stroke.playerId || 'unknown'
      };
      
      addAction({
        type: 'draw',
        data: {
          strokes: [completeStroke]
        },
        metadata: {
          brushSize: completeStroke.brushSize,
          color: completeStroke.color,
          isMultiplayer: true,
          playerId: stroke.playerId
        }
      });
      
    } catch (error) {
      console.error('❌ Error processing legacy stroke:', error);
    }
  }, [modelRef, addAction]);

  const handleDrawingStrokeStart = useCallback(() => {
    handleStartDrawing();
    if (multiplayer.isConnected) {
      multiplayer.startDrawingStroke(selectedColor, brushSize[0]);
    }
  }, [handleStartDrawing, multiplayer, selectedColor, brushSize]);

  const handleDrawingStrokeComplete = useCallback(() => {
    handleFinishDrawing();
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke();
    }
  }, [handleFinishDrawing, multiplayer]);

  const handleAddToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    if (multiplayer.isConnected) {
      multiplayer.addToDrawingStroke(worldPoint);
    }
  }, [multiplayer]);

  return {
    handleIncomingOptimizedStroke,
    handleIncomingDrawingStroke,
    handleDrawingStrokeStart,
    handleDrawingStrokeComplete,
    handleAddToDrawingStroke
  };
};
