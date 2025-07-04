
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
    console.log('🧹 ERASE OPERATION: Starting erase at', center, 'with radius', radius);
    console.log('🧹 ERASE OPERATION: Current user ID:', currentUserId);
    
    // Get all marks from stroke manager for debugging
    const allMarks = strokeManager.getAllMarks();
    console.log('🧹 ERASE OPERATION: Total marks in stroke manager:', allMarks.length);
    console.log('🧹 ERASE OPERATION: Sample marks:', allMarks.slice(0, 3));
    
    const marksToErase = spatialIndex.queryRadius(center, radius);
    console.log('🧹 ERASE OPERATION: Found', marksToErase.length, 'marks in radius');
    console.log('🧹 ERASE OPERATION: Marks to erase:', marksToErase.map(m => ({ id: m.id, userId: m.userId, strokeId: m.strokeId })));
    
    // Only erase marks created by the current user
    const userMarksToErase = marksToErase.filter(mark => {
      const isUserMark = mark.userId === currentUserId;
      console.log('🧹 ERASE OPERATION: Mark', mark.id, 'user:', mark.userId, 'current user:', currentUserId, 'should erase:', isUserMark);
      return isUserMark;
    });
    
    console.log('🧹 ERASE OPERATION: Will erase', userMarksToErase.length, 'user marks out of', marksToErase.length, 'total marks');
    
    if (userMarksToErase.length > 0) {
      // Get the full strokes that contain erased marks
      const strokesToRemove = new Set<string>();
      const strokesBeingErased: any[] = [];
      
      userMarksToErase.forEach(mark => {
        console.log('🧹 ERASE OPERATION: Adding stroke', mark.strokeId, 'to removal list');
        strokesToRemove.add(mark.strokeId);
      });
      
      // Store the complete strokes before removing them
      strokesToRemove.forEach(strokeId => {
        const stroke = strokeManager.completedStrokes.find(s => s.id === strokeId);
        if (stroke) {
          console.log('🧹 ERASE OPERATION: Found stroke to erase:', stroke.id, 'with', stroke.marks.length, 'marks');
          strokesBeingErased.push(stroke);
        }
        console.log('🧹 ERASE OPERATION: Removing stroke', strokeId, 'from stroke manager');
        strokeManager.removeStroke(strokeId);
      });

      console.log('🧹 ERASE OPERATION: Adding erase action to history with', strokesBeingErased.length, 'strokes');
      actionHistory.addAction({
        type: 'erase',
        data: {
          strokes: strokesBeingErased,
          erasedMarks: userMarksToErase,
          affectedArea: { center, radius }
        }
      });
    } else {
      console.log('🧹 ERASE OPERATION: No user marks to erase');
    }
    
    console.log('🧹 ERASE OPERATION: Returning', userMarksToErase.length, 'erased marks');
    return userMarksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId]);

  return {
    handleErase
  };
};
