
import { useCallback } from 'react';
import * as THREE from 'three';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { useSpatialIndex } from './useSpatialIndex';
import { TextMark } from '@/types/textTypes';
import { SensationMark } from '@/types/bodyMapperTypes';

interface UseEraseOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  spatialIndex: ReturnType<typeof useSpatialIndex>;
  currentUserId: string | null;
  textMarks?: () => TextMark[];
  deleteTextMark?: (id: string) => void;
  sensationMarks?: () => SensationMark[];
  deleteSensationMark?: (id: string) => void;
}

export const useEraseOperations = ({
  strokeManager,
  actionHistory,
  spatialIndex,
  currentUserId,
  textMarks,
  deleteTextMark,
  sensationMarks,
  deleteSensationMark
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
    
    // Check for sensation marks within radius
    const sensationMarksToErase: SensationMark[] = [];
    if (sensationMarks && deleteSensationMark) {
      const currentSensationMarks = sensationMarks();
      currentSensationMarks.forEach(sensationMark => {
        const distance = sensationMark.position.distanceTo(center);
        const sensationRadius = sensationMark.size || 0.1; // Use sensation size for collision
        // Note: Sensations are only on body surface, so no surface filtering needed
        if (distance <= radius + sensationRadius) {
          sensationMarksToErase.push(sensationMark);
        }
      });
    }
    
    console.log('🧹 ERASE OPERATION: Found', marksInRadius.length, 'drawing marks,', marksToErase.length, 'matching', surface, 'surface');
    console.log('🧹 ERASE OPERATION: Found', textMarksToErase.length, 'text marks to erase');
    console.log('🧹 ERASE OPERATION: Found', sensationMarksToErase.length, 'sensation marks to erase');
    
    // GLOBAL ERASING - Remove user filter to allow erasing any user's marks
    const hasContentToErase = marksToErase.length > 0 || textMarksToErase.length > 0 || sensationMarksToErase.length > 0;
    
    if (hasContentToErase) {
      console.log('🧹 ERASE OPERATION: Will erase', marksToErase.length, 'drawing marks,', textMarksToErase.length, 'text marks, and', sensationMarksToErase.length, 'sensation marks globally');
      
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

      // Handle sensation marks
      const erasedSensationMarks = [...sensationMarksToErase];
      sensationMarksToErase.forEach(sensationMark => {
        console.log('🧹 ERASE OPERATION: Removing sensation mark', sensationMark.id, 'with name:', sensationMark.name);
        deleteSensationMark?.(sensationMark.id);
      });

      // Record the action for undo/redo (only if current user initiated the erase)
      if (currentUserId) {
        actionHistory.addAction({
          type: 'erase',
          data: {
            strokes: strokesBeingErased,
            erasedMarks: marksToErase,
            erasedTextMarks: erasedTextMarks,
            erasedSensationMarks: erasedSensationMarks,
            affectedArea: { center, radius }
          }
        });
        console.log('🧹 ERASE OPERATION: Added erase action to history with text and sensation marks');
      }
      
      console.log('🧹 ERASE OPERATION: Successfully erased', marksToErase.length, 'drawing marks from', strokesToRemove.size, 'strokes,', textMarksToErase.length, 'text marks, and', sensationMarksToErase.length, 'sensation marks');
    } else {
      console.log('🧹 ERASE OPERATION: No marks to erase');
    }
    
    return marksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId, textMarks, deleteTextMark, sensationMarks, deleteSensationMark]);

  return {
    handleErase
  };
};
