
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
          console.log('Undoing erase action by restoring strokes');
          if (actionToUndo.data.strokes) {
            // Restore the erased strokes
            actionToUndo.data.strokes.forEach(stroke => {
              strokeManager.restoreStroke(stroke);
            });
          }
          break;
        case 'fill':
          console.log('Undoing fill action');
          if (actionToUndo.data.previousBodyPartColors !== undefined) {
            // Restore the previous body part colors state
            setBodyPartColors(actionToUndo.data.previousBodyPartColors);
            console.log('Restored previous body part colors:', actionToUndo.data.previousBodyPartColors);
          }
          break;
        case 'clear':
          console.log('Undoing clear action by restoring all cleared content');
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              strokeManager.restoreStroke(stroke);
            });
          }
          if (actionToUndo.data.previousBodyPartColors !== undefined) {
            setBodyPartColors(actionToUndo.data.previousBodyPartColors);
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
          console.log('Redoing draw action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              strokeManager.restoreStroke(stroke);
            });
          }
          break;
        case 'erase':
          console.log('Redoing erase action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'fill':
          console.log('Redoing fill action');
          if (actionToRedo.data.bodyPartColors) {
            setBodyPartColors(prev => ({
              ...prev,
              ...actionToRedo.data.bodyPartColors
            }));
            console.log('Applied body part colors after redo:', actionToRedo.data.bodyPartColors);
          }
          break;
        case 'clear':
          console.log('Redoing clear action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              strokeManager.removeStroke(stroke.id);
            });
          }
          if (actionToRedo.data.bodyPartColors) {
            setBodyPartColors({});
          }
          break;
      }
    }
    
    return actionToRedo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  return {
    handleUndo,
    handleRedo
  };
};
