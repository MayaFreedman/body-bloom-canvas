
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
    const previousColor = bodyPartColors[partName];
    
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));

    actionHistory.addAction({
      type: 'fill',
      data: {
        bodyPartColors: { [partName]: color }
      },
      metadata: {
        bodyPart: partName,
        color: color
      }
    });
  }, [bodyPartColors, actionHistory, setBodyPartColors]);

  const clearAll = useCallback(() => {
    // Only clear user's own strokes and body part fills
    const userStrokes = strokeManager.completedStrokes.filter(stroke => stroke.userId === currentUserId);
    
    strokeManager.removeStrokesByUser(currentUserId || '');
    
    // Note: Body part colors are global - might need different handling in multiplayer
    const currentColors = { ...bodyPartColors };
    setBodyPartColors({});

    actionHistory.addAction({
      type: 'clear',
      data: {
        strokes: userStrokes,
        bodyPartColors: currentColors
      }
    });
  }, [strokeManager, bodyPartColors, actionHistory, currentUserId, setBodyPartColors]);

  return {
    handleBodyPartClick,
    clearAll
  };
};
