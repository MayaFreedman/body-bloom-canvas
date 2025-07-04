
import { useCallback } from 'react';
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
  const handleIncomingOptimizedStroke = useCallback((optimizedStroke: OptimizedDrawingStroke) => {
    console.log('📨 Handling incoming optimized stroke - VISUAL ONLY, NO HISTORY RECORDING:', {
      id: optimizedStroke.id,
      keyPointsCount: optimizedStroke.keyPoints.length,
      color: optimizedStroke.metadata.color,
      size: optimizedStroke.metadata.size,
      playerId: optimizedStroke.playerId
    });
    
    try {
      const modelGroup = modelRef.current;
      if (!modelGroup) {
        console.warn('⚠️ Model group not available for stroke reconstruction');
        return;
      }

      if (!multiplayer.reconstructStroke) {
        console.warn('⚠️ Reconstruct stroke function not available');
        return;
      }

      if (!optimizedStroke || !optimizedStroke.keyPoints || optimizedStroke.keyPoints.length === 0) {
        console.warn('⚠️ Invalid optimized stroke data:', optimizedStroke);
        return;
      }

      const metadata = optimizedStroke.metadata;
      if (!metadata || !metadata.color || !metadata.size) {
        console.warn('⚠️ Missing stroke metadata, using defaults:', metadata);
      }

      const reconstructedPoints = multiplayer.reconstructStroke(optimizedStroke);
      console.log('🎨 Reconstructed', reconstructedPoints.length, 'points from', optimizedStroke.keyPoints.length, 'key points');
      
      if (reconstructedPoints.length === 0) {
        console.warn('⚠️ No points reconstructed from stroke');
        return;
      }

      const marks: DrawingMark[] = reconstructedPoints.map((worldPos, index) => {
        if (!worldPos || typeof worldPos.x !== 'number' || typeof worldPos.y !== 'number' || typeof worldPos.z !== 'number') {
          console.warn('⚠️ Invalid world position:', worldPos);
          return null;
        }

        const localPos = new THREE.Vector3();
        try {
          modelGroup.worldToLocal(localPos.copy(worldPos));
        } catch (error) {
          console.error('❌ Error converting world to local position:', error);
          return null;
        }
        
        return {
          id: `mp-reconstructed-${optimizedStroke.id}-${index}`, // MP prefix for multiplayer
          position: localPos,
          color: metadata.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, metadata.size / 200)),
          strokeId: `mp-${optimizedStroke.id}`, // MP prefix for multiplayer stroke
          timestamp: Date.now() + index,
          userId: optimizedStroke.playerId || 'unknown'
        };
      }).filter(mark => mark !== null) as DrawingMark[];
      
      if (marks.length === 0) {
        console.warn('⚠️ No valid marks created from reconstructed points');
        return;
      }

      const completeStroke = {
        id: `mp-${optimizedStroke.id}`, // MP prefix for multiplayer stroke
        marks: marks,
        startTime: metadata.startTime || Date.now() - 1000,
        endTime: metadata.endTime || Date.now(),
        brushSize: Math.max(1, Math.min(20, metadata.size || 3)),
        color: metadata.color || '#ff6b6b',
        isComplete: true,
        userId: optimizedStroke.playerId || 'unknown'
      };
      
      // CRITICAL: Only restore stroke visually, DO NOT add to action history
      // Multiplayer strokes should never be in local history
      restoreStroke(completeStroke);
      console.log('✅ Successfully restored optimized stroke VISUALLY ONLY (no history recording):', {
        marksCount: marks.length,
        color: completeStroke.color,
        size: completeStroke.brushSize
      });
    } catch (error) {
      console.error('❌ Error processing optimized stroke:', error, optimizedStroke);
    }
  }, [modelRef, restoreStroke, multiplayer]);

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    console.log('📨 Handling incoming legacy drawing stroke - VISUAL ONLY, NO HISTORY RECORDING:', {
      id: stroke.id,
      pointsCount: stroke.points?.length,
      firstPointColor: stroke.points?.[0]?.color,
      firstPointSize: stroke.points?.[0]?.size,
      playerId: stroke.playerId
    });
    
    try {
      if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
        console.warn('⚠️ Invalid stroke data:', stroke);
        return;
      }
      
      const modelGroup = modelRef.current;
      if (!modelGroup) {
        console.warn('⚠️ Model group not available for stroke processing');
        return;
      }

      console.log('🎨 Processing', stroke.points.length, 'points from incoming legacy stroke');
      
      const marks: DrawingMark[] = [];
      
      for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint: WorldDrawingPoint = stroke.points[i];
        
        if (!currentPoint || !currentPoint.worldPosition) {
          console.warn('⚠️ Invalid point data:', currentPoint);
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
          console.error('❌ Error converting world to local position:', error);
          continue;
        }
        
        const mark: DrawingMark = {
          id: `mp-legacy-${i}`, // MP prefix for multiplayer
          position: localPos,
          color: currentPoint.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
          strokeId: `mp-${stroke.id}`, // MP prefix for multiplayer stroke
          timestamp: Date.now() + i,
          userId: stroke.playerId || 'unknown'
        };
        
        marks.push(mark);
        
        if (i < stroke.points.length - 1) {
          const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
          if (nextPoint && nextPoint.worldPosition && currentPoint.bodyPart === nextPoint.bodyPart) {
            const nextWorldPos = new THREE.Vector3(
              nextPoint.worldPosition.x || 0,
              nextPoint.worldPosition.y || 0,
              nextPoint.worldPosition.z || 0
            );
            
            const distance = worldPos.distanceTo(nextWorldPos);
            const steps = Math.max(1, Math.min(15, Math.floor(distance * 50)));
            
            if (steps > 1) {
              for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const smoothT = t * t * (3 - 2 * t);
                const interpolatedWorldPos = new THREE.Vector3().lerpVectors(worldPos, nextWorldPos, smoothT);
                const interpolatedLocalPos = new THREE.Vector3();
                
                try {
                  modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedWorldPos));
                  
                  const interpolatedMark: DrawingMark = {
                    id: `mp-interpolated-${currentPoint.id}-${j}`, // MP prefix for multiplayer
                    position: interpolatedLocalPos,
                    color: currentPoint.color || '#ff6b6b',
                    size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
                    strokeId: `mp-${stroke.id}`, // MP prefix for multiplayer stroke
                    timestamp: Date.now() + i * 100 + j,
                    userId: stroke.playerId || 'unknown'
                  };
                  marks.push(interpolatedMark);
                } catch (error) {
                  console.error('❌ Error creating interpolated mark:', error);
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
        id: `mp-${stroke.id}`, // MP prefix for multiplayer stroke
        marks: marks,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        brushSize: Math.max(1, Math.min(20, stroke.points[0]?.size || 3)),
        color: stroke.points[0]?.color || '#ff6b6b',
        isComplete: true,
        userId: stroke.playerId || 'unknown'
      };
      
      // CRITICAL: Only restore stroke visually, DO NOT add to action history
      // Multiplayer strokes should never be in local history
      restoreStroke(completeStroke);
      console.log('✅ Successfully restored legacy stroke VISUALLY ONLY (no history recording):', {
        marksCount: marks.length,
        color: completeStroke.color,
        size: completeStroke.brushSize
      });
    } catch (error) {
      console.error('❌ Error processing legacy stroke:', error, stroke);
    }
  }, [modelRef, restoreStroke]);

  const handleDrawingStrokeStart = useCallback(() => {
    handleStartDrawing();
    if (multiplayer.isConnected) {
      console.log('🎨 Starting multiplayer stroke with current state:', {
        color: selectedColor,
        size: brushSize[0]
      });
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
