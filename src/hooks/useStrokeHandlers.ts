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
  // Track processed stroke IDs to prevent duplicates
  const processedStrokeIds = useRef(new Set<string>());

  const handleIncomingOptimizedStroke = useCallback((optimizedStroke: OptimizedDrawingStroke) => {
    console.log('📨 Handling incoming optimized stroke - VISUAL + HISTORY:', {
      id: optimizedStroke.id,
      keyPointsCount: optimizedStroke.keyPoints.length,
      color: optimizedStroke.metadata.color,
      size: optimizedStroke.metadata.size,
      playerId: optimizedStroke.playerId
    });
    
    // Check if we've already processed this stroke
    if (processedStrokeIds.current.has(optimizedStroke.id)) {
      console.log('⚠️ Stroke already processed, skipping:', optimizedStroke.id);
      return;
    }
    
    // Mark this stroke as processed
    processedStrokeIds.current.add(optimizedStroke.id);
    
    // Clean up old processed IDs (keep only last 100)
    if (processedStrokeIds.current.size > 100) {
      const idsArray = Array.from(processedStrokeIds.current);
      processedStrokeIds.current.clear();
      idsArray.slice(-50).forEach(id => processedStrokeIds.current.add(id));
    }
    
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

      // Determine surface type from first key point
      const firstKeyPoint = optimizedStroke.keyPoints[0];
      const surface = firstKeyPoint.surface || 'body'; // Fallback to body for legacy strokes
      
      console.log('🎨 Processing', surface, 'stroke with', optimizedStroke.keyPoints.length, 'key points');

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

        let localPos = new THREE.Vector3();
        
        try {
          if (surface === 'whiteboard') {
            // For whiteboard, use world coordinates directly
            localPos.copy(worldPos);
          } else {
            // For body, convert to model local space
            modelGroup.worldToLocal(localPos.copy(worldPos));
          }
        } catch (error) {
          console.error('❌ Error converting position for', surface, ':', error);
          return null;
        }
        
        return {
          id: `reconstructed-${optimizedStroke.id}-${index}`,
          position: localPos,
          color: metadata.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, metadata.size / 200)),
          strokeId: `${optimizedStroke.id}`,
          timestamp: Date.now() + index,
          userId: optimizedStroke.playerId || 'unknown',
          surface: surface, // Add surface information to mark
        };
      }).filter(mark => mark !== null) as DrawingMark[];
      
      if (marks.length === 0) {
        console.warn('⚠️ No valid marks created from reconstructed points');
        return;
      }

      const completeStroke = {
        id: `${optimizedStroke.id}`,
        marks: marks,
        surface: surface, // Add surface information to stroke
        startTime: metadata.startTime || Date.now() - 1000,
        endTime: metadata.endTime || Date.now(),
        brushSize: Math.max(1, Math.min(20, metadata.size || 3)),
        color: metadata.color || '#ff6b6b',
        isComplete: true,
        userId: optimizedStroke.playerId || 'unknown'
      };
      
      // Restore stroke visually ONLY - no action history here
      restoreStroke(completeStroke);
      
      // Add to action history for global undo/redo consistency - ONE action per complete stroke
      console.log('🎨 Adding SINGLE action to history for incoming optimized stroke:', completeStroke.id);
      addAction({
        type: 'draw',
        data: {
          strokes: [completeStroke]
        },
        metadata: {
          brushSize: completeStroke.brushSize,
          color: completeStroke.color
        }
      });
      
      console.log('✅ Successfully restored optimized stroke (visual + history):', {
        marksCount: marks.length,
        color: completeStroke.color,
        size: completeStroke.brushSize
      });
    } catch (error) {
      console.error('❌ Error processing optimized stroke:', error, optimizedStroke);
    }
  }, [modelRef, restoreStroke, multiplayer.reconstructStroke, addAction]);

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    console.log('📨 Handling incoming legacy drawing stroke - VISUAL + HISTORY:', {
      id: stroke.id,
      pointsCount: stroke.points?.length,
      firstPointColor: stroke.points?.[0]?.color,
      firstPointSize: stroke.points?.[0]?.size,
      playerId: stroke.playerId
    });
    
    // Check if we've already processed this stroke
    if (processedStrokeIds.current.has(stroke.id)) {
      console.log('⚠️ Legacy stroke already processed, skipping:', stroke.id);
      return;
    }
    
    // Mark this stroke as processed
    processedStrokeIds.current.add(stroke.id);
    
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
      
      // Determine surface from first point
      const firstPoint: WorldDrawingPoint = stroke.points[0];
      const surface = firstPoint?.surface || 'body'; // Fallback to body for legacy strokes
      
      console.log('🎨 Processing legacy', surface, 'stroke with', stroke.points.length, 'points');
      
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
        
        let localPos = new THREE.Vector3();
        try {
          if (surface === 'whiteboard') {
            // For whiteboard, use world coordinates directly
            localPos.copy(worldPos);
          } else {
            // For body, convert to model local space
            modelGroup.worldToLocal(localPos.copy(worldPos));
          }
        } catch (error) {
          console.error('❌ Error converting position for', surface, ':', error);
          continue;
        }
        
        const mark: DrawingMark = {
          id: `legacy-${i}`,
          position: localPos,
          color: currentPoint.color || '#ff6b6b',
          size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
          strokeId: `${stroke.id}`,
          timestamp: Date.now() + i,
          userId: stroke.playerId || 'unknown',
          surface: surface
        };
        
        marks.push(mark);
        
        // For legacy strokes, only interpolate on body surface (skip whiteboard interpolation for legacy)
        if (surface === 'body' && i < stroke.points.length - 1) {
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
                    id: `interpolated-${currentPoint.id}-${j}`,
                    position: interpolatedLocalPos,
                    color: currentPoint.color || '#ff6b6b',
                    size: Math.max(0.001, Math.min(0.1, (currentPoint.size || 3) / 200)),
                    strokeId: `${stroke.id}`,
                    timestamp: Date.now() + i * 100 + j,
                    userId: stroke.playerId || 'unknown',
                    surface: surface
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
        id: `${stroke.id}`,
        marks: marks,
        surface: surface,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        brushSize: Math.max(1, Math.min(20, stroke.points[0]?.size || 3)),
        color: stroke.points[0]?.color || '#ff6b6b',
        isComplete: true,
        userId: stroke.playerId || 'unknown'
      };
      
      // Restore stroke visually ONLY - no action history here
      restoreStroke(completeStroke);
      
      // Add to action history for global undo/redo consistency - ONE action per complete stroke
      console.log('🎨 Adding SINGLE action to history for incoming legacy stroke:', completeStroke.id);
      addAction({
        type: 'draw',
        data: {
          strokes: [completeStroke]
        },
        metadata: {
          brushSize: completeStroke.brushSize,
          color: completeStroke.color
        }
      });
      
      console.log('✅ Successfully restored legacy stroke (visual + history):', {
        marksCount: marks.length,
        color: completeStroke.color,
        size: completeStroke.brushSize
      });
    } catch (error) {
      console.error('❌ Error processing legacy stroke:', error, stroke);
    }
  }, [modelRef, restoreStroke, addAction]);

  const handleDrawingStrokeStart = useCallback(() => {
    handleStartDrawing();
    if (multiplayer.isConnected) {
      console.log('🎨 Starting multiplayer stroke with current state:', {
        color: selectedColor,
        size: brushSize[0]
      });
      multiplayer.startDrawingStroke(selectedColor, brushSize[0]);
    }
  }, [handleStartDrawing, multiplayer.isConnected, multiplayer.startDrawingStroke, selectedColor, brushSize]);

  const handleDrawingStrokeComplete = useCallback(() => {
    console.log('🎨 Completing drawing stroke - this should add ONE action to history');
    handleFinishDrawing();
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke();
    }
  }, [handleFinishDrawing, multiplayer.isConnected, multiplayer.finishDrawingStroke]);

  const handleAddToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    if (multiplayer.isConnected) {
      multiplayer.addToDrawingStroke(worldPoint);
    }
  }, [multiplayer.isConnected, multiplayer.addToDrawingStroke]);

  return {
    handleIncomingOptimizedStroke,
    handleIncomingDrawingStroke,
    handleDrawingStrokeStart,
    handleDrawingStrokeComplete,
    handleAddToDrawingStroke
  };
};
