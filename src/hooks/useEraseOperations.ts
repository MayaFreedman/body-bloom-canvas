
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
      // Remove strokes that contain erased marks
      const strokesToRemove = new Set<string>();
      userMarksToErase.forEach(mark => strokesToRemove.add(mark.strokeId));
      
      strokesToRemove.forEach(strokeId => {
        strokeManager.removeStroke(strokeId);
      });

      actionHistory.addAction({
        type: 'erase',
        data: {
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
