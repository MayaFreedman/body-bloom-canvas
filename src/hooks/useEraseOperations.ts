
import { useCallback } from 'react';
import * as THREE from 'three';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { useSpatialIndex } from './useSpatialIndex';
import { TextMark } from '@/types/textTypes';

interface UseEraseOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  spatialIndex: ReturnType<typeof useSpatialIndex>;
  currentUserId: string | null;
  textMarks?: () => TextMark[];
  deleteTextMark?: (id: string) => void;
}

export const useEraseOperations = ({
  strokeManager,
  actionHistory,
  spatialIndex,
  currentUserId,
  textMarks,
  deleteTextMark
}: UseEraseOperationsProps) => {
  const handleErase = useCallback((center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    console.log('🧹 ERASE OPERATION: Starting', surface, 'erase at', center, 'with radius', radius);
    
    // Get all drawing marks in radius, then filter by surface
    const marksInRadius = spatialIndex.queryRadius(center, radius);
    const marksToErase = marksInRadius.filter(mark => {
      // Filter by surface - only erase marks from the current drawing target
      return mark.surface === surface || (!mark.surface && surface === 'body'); // Fallback for legacy marks without surface
    });
    
    // Check for text marks within radius
    const textMarksToErase: TextMark[] = [];
    if (textMarks && deleteTextMark) {
      const currentTextMarks = textMarks();
      currentTextMarks.forEach(textMark => {
        const distance = textMark.position.distanceTo(center);
        const textRadius = (textMark.fontSize || 16) * 0.01; // Approximate text collision radius
        if (distance <= radius + textRadius && textMark.surface === surface) {
          textMarksToErase.push(textMark);
        }
      });
    }
    
    console.log('🧹 ERASE OPERATION: Found', marksInRadius.length, 'drawing marks,', marksToErase.length, 'matching', surface, 'surface');
    console.log('🧹 ERASE OPERATION: Found', textMarksToErase.length, 'text marks to erase');
    
    // GLOBAL ERASING - Remove user filter to allow erasing any user's marks
    const hasContentToErase = marksToErase.length > 0 || textMarksToErase.length > 0;
    
    if (hasContentToErase) {
      console.log('🧹 ERASE OPERATION: Will erase', marksToErase.length, 'drawing marks and', textMarksToErase.length, 'text marks globally');
      
      // Handle drawing marks
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

      // Handle text marks
      const erasedTextMarks = [...textMarksToErase];
      textMarksToErase.forEach(textMark => {
        console.log('🧹 ERASE OPERATION: Removing text mark', textMark.id, 'with text:', textMark.text);
        deleteTextMark?.(textMark.id);
      });

      // Record the action for undo/redo (only if current user initiated the erase)
      if (currentUserId) {
        actionHistory.addAction({
          type: 'erase',
          data: {
            strokes: strokesBeingErased,
            erasedMarks: marksToErase,
            erasedTextMarks: erasedTextMarks,
            affectedArea: { center, radius }
          }
        });
        console.log('🧹 ERASE OPERATION: Added erase action to history with text marks');
      }
      
      console.log('🧹 ERASE OPERATION: Successfully erased', marksToErase.length, 'drawing marks from', strokesToRemove.size, 'strokes and', textMarksToErase.length, 'text marks');
    } else {
      console.log('🧹 ERASE OPERATION: No marks to erase');
    }
    
    return marksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId, textMarks, deleteTextMark]);

  return {
    handleErase
  };
};
