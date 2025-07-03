
import { useCallback } from 'react';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';

interface UseUndoRedoOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const useUndoRedoOperations = ({
  strokeManager,
  actionHistory,
  setBodyPartColors
}: UseUndoRedoOperationsProps) => {
  const handleUndo = useCallback(() => {
    const actionToUndo = actionHistory.undo();
    
    if (actionToUndo) {
      switch (actionToUndo.type) {
        case 'draw':
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'erase':
          // Re-add erased marks (would need to restore strokes)
          console.log('Undo erase not fully implemented yet');
          break;
        case 'fill':
          if (actionToUndo.data.bodyPartColors) {
            // Restore previous body part colors
            setBodyPartColors(prev => {
              const updated = { ...prev };
              Object.keys(actionToUndo.data.bodyPartColors!).forEach(part => {
                delete updated[part];
              });
              return updated;
            });
          }
          break;
      }
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  const handleRedo = useCallback(() => {
    const actionToRedo = actionHistory.redo();
    
    if (actionToRedo) {
      switch (actionToRedo.type) {
        case 'draw':
          if (actionToRedo.data.strokes) {
            // Re-add strokes (would need more complex state restoration)  
            console.log('Redo draw not fully implemented yet');
          }
          break;
        case 'fill':
          if (actionToRedo.data.bodyPartColors) {
            setBodyPartColors(prev => ({
              ...prev,
              ...actionToRedo.data.bodyPartColors
            }));
          }
          break;
      }
    }
    
    return actionToRedo;
  }, [actionHistory, setBodyPartColors]);

  return {
    handleUndo,
    handleRedo
  };
};
