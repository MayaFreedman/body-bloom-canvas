
import { useCallback } from 'react';
import { useMultiplayer } from './useMultiplayer';
import { DrawingMark } from '@/types/actionHistoryTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
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

  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    console.log('📨 Handling incoming drawing stroke:', stroke);
    
    if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
      console.warn('⚠️ Invalid stroke data:', stroke);
      return;
    }
    
    const modelGroup = modelRef.current;
    if (modelGroup) {
      console.log('🎨 Processing', stroke.points.length, 'points from incoming stroke');
      
      const marks: DrawingMark[] = [];
      
      for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint: WorldDrawingPoint = stroke.points[i];
        const worldPos = new THREE.Vector3(
          currentPoint.worldPosition.x,
          currentPoint.worldPosition.y,
          currentPoint.worldPosition.z
        );
        
        const localPos = new THREE.Vector3();
        modelGroup.worldToLocal(localPos.copy(worldPos));
        
        const mark: DrawingMark = {
          id: currentPoint.id,
          position: localPos,
          color: currentPoint.color,
          size: currentPoint.size,
          strokeId: stroke.id,
          timestamp: Date.now(),
          userId: stroke.playerId
        };
        
        marks.push(mark);
        
        if (i < stroke.points.length - 1) {
          const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
          const nextWorldPos = new THREE.Vector3(
            nextPoint.worldPosition.x,
            nextPoint.worldPosition.y,
            nextPoint.worldPosition.z
          );
          
          if (currentPoint.bodyPart === nextPoint.bodyPart) {
            const distance = worldPos.distanceTo(nextWorldPos);
            const steps = Math.max(1, Math.floor(distance * 50));
            
            if (steps > 1) {
              for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const interpolatedWorldPos = new THREE.Vector3().lerpVectors(worldPos, nextWorldPos, t);
                const interpolatedLocalPos = new THREE.Vector3();
                modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedWorldPos));
                
                const interpolatedMark: DrawingMark = {
                  id: `interpolated-${currentPoint.id}-${j}`,
                  position: interpolatedLocalPos,
                  color: currentPoint.color,
                  size: currentPoint.size,
                  strokeId: stroke.id,
                  timestamp: Date.now(),
                  userId: stroke.playerId
                };
                marks.push(interpolatedMark);
              }
            }
          }
        }
      }
      
      const completeStroke = {
        id: stroke.id,
        marks: marks,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        brushSize: stroke.points[0]?.size || 3,
        color: stroke.points[0]?.color || '#ff6b6b',
        isComplete: true,
        userId: stroke.playerId
      };
      
      restoreStroke(completeStroke);
      
      console.log(`✅ Successfully restored incoming drawing stroke with ${marks.length} marks`);
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
      multiplayer.startDrawingStroke();
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
    handleSensationClick,
    handleResetAll,
    handleAddToDrawingStroke,
    handleDrawingStrokeStart,
    handleDrawingStrokeComplete
  };
};
