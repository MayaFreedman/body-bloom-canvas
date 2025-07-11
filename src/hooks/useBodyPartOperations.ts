
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
    
    if (color === 'CLEAR_FILL') {
      // Remove the body part color (clear fill)
      const newColors = { ...previousColors };
      delete newColors[partName];
      setBodyPartColors(newColors);

      actionHistory.addAction({
        type: 'clearFill',
        data: {
          bodyPartColors: newColors,
          previousBodyPartColors: previousColors
        },
        metadata: {
          bodyPart: partName,
          action: 'clear'
        }
      });
    } else {
      // Normal fill operation
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
    }
  }, [bodyPartColors, actionHistory, setBodyPartColors]);

  const clearAll = useCallback(() => {
    // Clear all strokes and store them for undo (global system)
    const allStrokes = [...strokeManager.completedStrokes];
    const previousColors = { ...bodyPartColors };
    
    // Clear all strokes regardless of user
    strokeManager.completedStrokes.forEach(stroke => {
      strokeManager.removeStroke(stroke.id);
    });
    setBodyPartColors({});

    actionHistory.addAction({
      type: 'clear',
      data: {
        strokes: allStrokes,
        bodyPartColors: {},
        previousBodyPartColors: previousColors
      }
    });
  }, [strokeManager, bodyPartColors, actionHistory, setBodyPartColors]);

  return {
    handleBodyPartClick,
    clearAll
  };
};
