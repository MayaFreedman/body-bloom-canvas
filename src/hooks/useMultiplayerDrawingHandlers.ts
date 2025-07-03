
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { DrawingMark } from '@/types/actionHistoryTypes';
import { WorldDrawingPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface UseMultiplayerDrawingHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  handleStartDrawing: () => void;
  handleFinishDrawing: () => void;
  baseHandleBodyPartClick: (partName: string, color: string) => void;
  restoreStroke: (stroke: any) => void;
  modelRef: React.RefObject<THREE.Group>;
  clearAll: () => void;
}

export const useMultiplayerDrawingHandlers = ({
  multiplayer,
  handleStartDrawing,
  handleFinishDrawing,
  baseHandleBodyPartClick,
  restoreStroke,
  modelRef,
  clearAll
}: UseMultiplayerDrawingHandlersProps) => {
  const handleEmotionsUpdate = useCallback((updateData: any) => {
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'emotionUpdate',
        data: updateData
      });
    }
  }, [multiplayer]);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    baseHandleBodyPartClick(partName, color);
    
    if (multiplayer.isConnected) {
      multiplayer.broadcastBodyPartFill({ partName, color });
    }
  }, [baseHandleBodyPartClick, multiplayer]);

  const handleIncomingBodyPartFill = useCallback((partName: string, color: string) => {
    console.log('📨 Handling incoming body part fill:', partName, color);
    baseHandleBodyPartClick(partName, color);
  }, [baseHandleBodyPartClick]);

  const handleIncomingOptimizedStroke = useCallback((optimizedStroke: OptimizedDrawingStroke) => {
    console.log('📨 Handling incoming optimized stroke:', optimizedStroke);
    
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

      const reconstructedPoints = multiplayer.reconstructStroke(optimizedStroke);
      console.log('🎨 Reconstructed', reconstructedPoints.length, 'points from', optimizedStroke.keyPoints.length, 'key points');
      
      if (reconstructedPoints.length === 0) {
        console.warn('⚠️ No points reconstructed from stroke');
        return;
      }

      const marks: DrawingMark[] = reconstructedPoints.map((worldPos, index) => {
        // Validate world position
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
          id: `reconstructed-${optimizedStroke.id}-${index}`,
          position: localPos,
          color: optimizedStroke.metadata.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, optimizedStroke.metadata.size / 200)), // Clamp size to reasonable bounds
          strokeId: optimizedStroke.id,
          timestamp: Date.now() + index,
          userId: optimizedStroke.playerId || 'unknown'
        };
      }).filter(mark => mark !== null) as DrawingMark[];
      
      if (marks.length === 0) {
        console.warn('⚠️ No valid marks created from reconstructed points');
        return;
      }

      const completeStroke = {
        id: optimizedStroke.id,
        marks: marks,
        startTime: optimizedStroke.metadata.startTime || Date.now() - 1000,
        endTime: optimizedStroke.metadata.endTime || Date.now(),
        brushSize: Math.max(1, Math.min(20, optimizedStroke.metadata.size || 3)), // Clamp brush size
        color: optimizedStroke.metadata.color || '#ff6b6b',
        isComplete: true,
        userId: optimizedStroke.playerId || 'unknown'
      };
      
      restoreStroke(completeStroke);
      console.log(`✅ Successfully restored optimized stroke with ${marks.length} marks`);
    } catch (error) {
      console.error('❌ Error processing optimized stroke:', error, optimizedStroke);
    }
  }, [modelRef, restoreStroke, multiplayer]);

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    console.log('📨 Handling incoming legacy drawing stroke:', stroke);
    
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
          id: currentPoint.id || `legacy-${i}`,
          position: localPos,
          color: currentPoint.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)), // Clamp size
          strokeId: stroke.id,
          timestamp: Date.now() + i,
          userId: stroke.playerId || 'unknown'
        };
        
        marks.push(mark);
        
        // Interpolation logic - simplified and safer
        if (i < stroke.points.length - 1) {
          const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
          if (nextPoint && nextPoint.worldPosition && currentPoint.bodyPart === nextPoint.bodyPart) {
            const nextWorldPos = new THREE.Vector3(
              nextPoint.worldPosition.x || 0,
              nextPoint.worldPosition.y || 0,
              nextPoint.worldPosition.z || 0
            );
            
            const distance = worldPos.distanceTo(nextWorldPos);
            const steps = Math.max(1, Math.min(10, Math.floor(distance * 30))); // Limit interpolation steps
            
            if (steps > 1) {
              for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const interpolatedWorldPos = new THREE.Vector3().lerpVectors(worldPos, nextWorldPos, t);
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
        id: stroke.id,
        marks: marks,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        brushSize: Math.max(1, Math.min(20, stroke.points[0]?.size || 3)),
        color: stroke.points[0]?.color || '#ff6b6b',
        isComplete: true,
        userId: stroke.playerId || 'unknown'
      };
      
      restoreStroke(completeStroke);
      console.log(`✅ Successfully restored incoming legacy drawing stroke with ${marks.length} marks`);
    } catch (error) {
      console.error('❌ Error processing legacy stroke:', error, stroke);
    }
  }, [modelRef, restoreStroke]);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => {
    console.log('Sensation clicked:', position, sensation);
    
    if (multiplayer.isConnected) {
      const sensationMark = {
        id: `sensation-${Date.now()}-${Math.random()}`,
        position,
        icon: sensation.icon,
        color: sensation.color,
        size: 0.1
      };
      multiplayer.broadcastSensation(sensationMark);
    }
  }, [multiplayer]);

  const handleResetAll = useCallback(() => {
    clearAll();
    
    if (multiplayer.isConnected) {
      multiplayer.broadcastReset();
    }
  }, [clearAll, multiplayer]);

  const handleAddToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    if (multiplayer.isConnected) {
      multiplayer.addToDrawingStroke(worldPoint);
    }
  }, [multiplayer]);

  const handleDrawingStrokeStart = useCallback(() => {
    handleStartDrawing();
    if (multiplayer.isConnected) {
      // Get current drawing state to pass to multiplayer
      const currentColor = '#ff6b6b'; // This should come from the actual state
      const currentSize = 3; // This should come from the actual state
      multiplayer.startDrawingStroke(currentColor, currentSize);
    }
  }, [handleStartDrawing, multiplayer]);

  const handleDrawingStrokeComplete = useCallback(() => {
    handleFinishDrawing();
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke();
    }
  }, [handleFinishDrawing, multiplayer]);

  return {
    handleEmotionsUpdate,
    handleBodyPartClick,
    handleIncomingBodyPartFill,
    handleIncomingDrawingStroke,
    handleIncomingOptimizedStroke,
    handleSensationClick,
    handleResetAll,
    handleAddToDrawingStroke,
    handleDrawingStrokeStart,
    handleDrawingStrokeComplete
  };
};
