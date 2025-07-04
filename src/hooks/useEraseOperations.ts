
import { useCallback } from 'react';
import * as THREE from 'three';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { useSpatialIndex } from './useSpatialIndex';

interface UseEraseOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  spatialIndex: ReturnType<typeof useSpatialIndex>;
  currentUserId: string | null;
}

export const useEraseOperations = ({
  strokeManager,
  actionHistory,
  spatialIndex,
  currentUserId
}: UseEraseOperationsProps) => {
  const handleErase = useCallback((center: THREE.Vector3, radius: number) => {
    const marksToErase = spatialIndex.queryRadius(center, radius);
    
    // Only erase marks created by the current user
    const userMarksToErase = marksToErase.filter(mark => mark.userId === currentUserId);
    
    if (userMarksToErase.length > 0) {
      // Get the full strokes that contain erased marks
      const strokesToRemove = new Set<string>();
      const strokesBeingErased: any[] = [];
      
      userMarksToErase.forEach(mark => strokesToRemove.add(mark.strokeId));
      
      // Store the complete strokes before removing them
      strokesToRemove.forEach(strokeId => {
        const stroke = strokeManager.completedStrokes.find(s => s.id === strokeId);
        if (stroke) {
          strokesBeingErased.push(stroke);
        }
        strokeManager.removeStroke(strokeId);
      });

      actionHistory.addAction({
        type: 'erase',
        data: {
          strokes: strokesBeingErased,
          erasedMarks: userMarksToErase,
          affectedArea: { center, radius }
        }
      });
    }
    
    return userMarksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId]);

  return {
    handleErase
  };
};
