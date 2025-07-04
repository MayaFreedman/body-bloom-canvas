
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
    console.log('🧹 ERASE OPERATION: Starting global erase at', center, 'with radius', radius);
    
    const marksToErase = spatialIndex.queryRadius(center, radius);
    console.log('🧹 ERASE OPERATION: Found', marksToErase.length, 'marks in radius');
    
    // GLOBAL ERASING - Remove user filter to allow erasing any user's marks
    if (marksToErase.length > 0) {
      console.log('🧹 ERASE OPERATION: Will erase', marksToErase.length, 'marks globally');
      
      // Get the full strokes that contain erased marks
      const strokesToRemove = new Set<string>();
      const strokesBeingErased: any[] = [];
      
      marksToErase.forEach(mark => {
        console.log('🧹 ERASE OPERATION: Processing mark', mark.id, 'from stroke', mark.strokeId, 'by user', mark.userId);
        strokesToRemove.add(mark.strokeId);
      });
      
      // Store the complete strokes before removing them
      strokesToRemove.forEach(strokeId => {
        const stroke = strokeManager.completedStrokes.find(s => s.id === strokeId);
        if (stroke) {
          console.log('🧹 ERASE OPERATION: Found and storing stroke', strokeId, 'with', stroke.marks.length, 'marks');
          strokesBeingErased.push(stroke);
        }
        console.log('🧹 ERASE OPERATION: Removing stroke', strokeId);
        strokeManager.removeStroke(strokeId);
      });

      // Record the action for undo/redo (only if current user initiated the erase)
      if (currentUserId) {
        actionHistory.addAction({
          type: 'erase',
          data: {
            strokes: strokesBeingErased,
            erasedMarks: marksToErase,
            affectedArea: { center, radius }
          }
        });
        console.log('🧹 ERASE OPERATION: Added erase action to history');
      }
      
      console.log('🧹 ERASE OPERATION: Successfully erased', marksToErase.length, 'marks from', strokesToRemove.size, 'strokes');
    } else {
      console.log('🧹 ERASE OPERATION: No marks to erase');
    }
    
    return marksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId]);

  return {
    handleErase
  };
};
