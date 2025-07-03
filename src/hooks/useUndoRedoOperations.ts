
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
    console.log('handleUndo called');
    const actionToUndo = actionHistory.undo();
    console.log('Action to undo:', actionToUndo);
    
    if (actionToUndo) {
      switch (actionToUndo.type) {
        case 'draw':
          console.log('Undoing draw action with strokes:', actionToUndo.data.strokes);
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              console.log('Removing stroke:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'erase':
          // Re-add erased marks (would need to restore strokes)
          console.log('Undo erase not fully implemented yet');
          break;
        case 'fill':
          console.log('Undoing fill action');
          if (actionToUndo.data.bodyPartColors) {
            // Restore previous body part colors
            setBodyPartColors(prev => {
              const updated = { ...prev };
              Object.keys(actionToUndo.data.bodyPartColors!).forEach(part => {
                delete updated[part];
              });
              console.log('Updated body part colors after undo:', updated);
              return updated;
            });
          }
          break;
      }
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  const handleRedo = useCallback(() => {
    console.log('handleRedo called');
    const actionToRedo = actionHistory.redo();
    console.log('Action to redo:', actionToRedo);
    
    if (actionToRedo) {
      switch (actionToRedo.type) {
        case 'draw':
          if (actionToRedo.data.strokes) {
            // Re-add strokes (would need more complex state restoration)  
            console.log('Redo draw not fully implemented yet');
          }
          break;
        case 'fill':
          console.log('Redoing fill action');
          if (actionToRedo.data.bodyPartColors) {
            setBodyPartColors(prev => {
              const updated = {
                ...prev,
                ...actionToRedo.data.bodyPartColors
              };
              console.log('Updated body part colors after redo:', updated);
              return updated;
            });
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
