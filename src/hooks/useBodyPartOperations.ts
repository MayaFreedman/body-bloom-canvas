
import { useCallback } from 'react';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';

interface UseBodyPartOperationsProps {
  actionHistory: ReturnType<typeof useActionHistory>;
  strokeManager: ReturnType<typeof useStrokeManager>;
  bodyPartColors: Record<string, string>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentUserId: string | null;
}

export const useBodyPartOperations = ({
  actionHistory,
  strokeManager,
  bodyPartColors,
  setBodyPartColors,
  currentUserId
}: UseBodyPartOperationsProps) => {
  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    const previousColors = { ...bodyPartColors };
    
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));

    actionHistory.addAction({
      type: 'fill',
      data: {
        bodyPartColors: { [partName]: color },
        previousBodyPartColors: previousColors
      },
      metadata: {
        bodyPart: partName,
        color: color
      }
    });
  }, [bodyPartColors, actionHistory, setBodyPartColors]);

  const clearAll = useCallback(() => {
    console.log('🧹 clearAll called - removing ALL strokes and colors from ALL users');
    
    // Get all strokes from all users for potential undo
    const allStrokes = strokeManager.completedStrokes;
    const previousColors = { ...bodyPartColors };
    
    console.log('🧹 Clearing', allStrokes.length, 'strokes from all users');
    console.log('🧹 Clearing colors:', Object.keys(previousColors).length, 'body parts');
    
    // Clear everything regardless of user
    strokeManager.clearAllStrokes();
    setBodyPartColors({});

    // Only record action for current user (for their undo history)
    if (currentUserId) {
      actionHistory.addAction({
        type: 'clear',
        data: {
          strokes: allStrokes,
          bodyPartColors: {},
          previousBodyPartColors: previousColors
        }
      });
    }
  }, [strokeManager, bodyPartColors, actionHistory, currentUserId, setBodyPartColors]);

  return {
    handleBodyPartClick,
    clearAll
  };
};
