
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
    // Prevent duplicate processing
    if (processedStrokes.current.has(optimizedStroke.id)) {
      console.log('⚠️ Skipping duplicate stroke:', optimizedStroke.id);
      return;
    }
    
    console.log('📨 Processing new optimized stroke:', optimizedStroke.id, 'from player:', optimizedStroke.playerId);
    processedStrokes.current.add(optimizedStroke.id);
    
    try {
      const modelGroup = modelRef.current;
      if (!modelGroup) {
        console.warn('⚠️ Model group not available');
        return;
      }

      if (!multiplayer.reconstructStroke) {
        console.warn('⚠️ Reconstruct stroke function not available');
        return;
      }

      if (!optimizedStroke || !optimizedStroke.keyPoints || optimizedStroke.keyPoints.length === 0) {
        console.warn('⚠️ Invalid optimized stroke data');
        return;
      }

      const metadata = optimizedStroke.metadata;
      if (!metadata || !metadata.color || !metadata.size) {
        console.warn('⚠️ Missing stroke metadata, using defaults');
      }

      const reconstructedPoints = multiplayer.reconstructStroke(optimizedStroke);
      console.log('🎨 Reconstructed', reconstructedPoints.length, 'points from', optimizedStroke.keyPoints.length, 'key points');
      
      if (reconstructedPoints.length === 0) {
        console.warn('⚠️ No points reconstructed');
        return;
      }

      const marks: DrawingMark[] = reconstructedPoints.map((worldPos, index) => {
        if (!worldPos || typeof worldPos.x !== 'number' || typeof worldPos.y !== 'number' || typeof worldPos.z !== 'number') {
          return null;
        }

        const localPos = new THREE.Vector3();
        try {
          modelGroup.worldToLocal(localPos.copy(worldPos));
        } catch (error) {
          console.error('❌ Error converting position:', error);
          return null;
        }
        
        return {
          id: `reconstructed-${optimizedStroke.id}-${index}`,
          position: localPos,
          color: metadata.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, metadata.size / 200)),
          strokeId: optimizedStroke.id,
          timestamp: Date.now() + index,
          userId: optimizedStroke.playerId || 'unknown'
        };
      }).filter(mark => mark !== null) as DrawingMark[];
      
      if (marks.length === 0) {
        console.warn('⚠️ No valid marks created');
        return;
      }

      const completeStroke = {
        id: optimizedStroke.id,
        marks: marks,
        startTime: metadata.startTime || Date.now() - 1000,
        endTime: metadata.endTime || Date.now(),
        brushSize: Math.max(1, Math.min(20, metadata.size || 3)),
        color: metadata.color || '#ff6b6b',
        isComplete: true,
        userId: optimizedStroke.playerId || 'unknown'
      };
      
      // Add action to history - this will handle the stroke storage
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
      
      console.log('✅ Processed stroke:', optimizedStroke.id, 'with', marks.length, 'marks');
    } catch (error) {
      console.error('❌ Error processing optimized stroke:', error);
    }
  }, [modelRef, multiplayer, addAction]);

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    // Prevent duplicate processing
    if (processedStrokes.current.has(stroke.id)) {
      console.log('⚠️ Skipping duplicate legacy stroke:', stroke.id);
      return;
    }
    
    console.log('📨 Processing legacy stroke:', stroke.id, 'from player:', stroke.playerId);
    processedStrokes.current.add(stroke.id);
    
    try {
      if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
        console.warn('⚠️ Invalid stroke data');
        return;
      }
      
      const modelGroup = modelRef.current;
      if (!modelGroup) {
        console.warn('⚠️ Model group not available');
        return;
      }

      const marks: DrawingMark[] = [];
      
      for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint: WorldDrawingPoint = stroke.points[i];
        
        if (!currentPoint || !currentPoint.worldPosition) {
          continue;
        }

        const worldPos = new THREE.Vector3(
          currentPoint.worldPosition.x || 0,
          currentPoint.worldPosition.y || 0,
          currentPoint.worldPosition.z || 0
        );
        
        const localPos = new THREE.Vector3();
        try {
          modelGroup.worldToLocal(localPos.copy(worldPos));
        } catch (error) {
          continue;
        }
        
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
        
        // Simplified interpolation for legacy strokes
        if (i < stroke.points.length - 1) {
          const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
          if (nextPoint && nextPoint.worldPosition && currentPoint.bodyPart === nextPoint.bodyPart) {
            const nextWorldPos = new THREE.Vector3(
              nextPoint.worldPosition.x || 0,
              nextPoint.worldPosition.y || 0,
              nextPoint.worldPosition.z || 0
            );
            
            const distance = worldPos.distanceTo(nextWorldPos);
            const steps = Math.max(1, Math.min(10, Math.floor(distance * 30)));
            
            if (steps > 1) {
              for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const smoothT = t * t * (3 - 2 * t);
                const interpolatedWorldPos = new THREE.Vector3().lerpVectors(worldPos, nextWorldPos, smoothT);
                const interpolatedLocalPos = new THREE.Vector3();
                
                try {
                  modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedWorldPos));
                  
                  const interpolatedMark: DrawingMark = {
                    id: `interpolated-${currentPoint.id}-${j}`,
                    position: interpolatedLocalPos,
                    color: currentPoint.color || '#ff6b6b',
                    size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
                    strokeId: stroke.id,
                    timestamp: Date.now() + i * 100 + j,
                    userId: stroke.playerId || 'unknown'
                  };
                  marks.push(interpolatedMark);
                } catch (error) {
                  // Skip invalid interpolated marks
                }
              }
            }
          }
        }
      }
      
      if (marks.length === 0) {
        console.warn('⚠️ No valid marks created from legacy stroke');
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
      
      // Add action to history
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
      
      console.log('✅ Processed legacy stroke:', stroke.id, 'with', marks.length, 'marks');
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
