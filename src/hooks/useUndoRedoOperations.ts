
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
    console.log('🔄 handleUndo called');
    const actionToUndo = actionHistory.undo();
    
    // If there's no action to undo for this user, return early
    if (!actionToUndo) {
      console.log('❌ No action to undo for current user');
      return null;
    }
    
    console.log('🔄 Action to undo:', actionToUndo?.type, actionToUndo?.id);
    
    try {
      switch (actionToUndo.type) {
        case 'draw':
          console.log('↩️ Undoing draw action with strokes:', actionToUndo.data.strokes?.length);
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              console.log('🗑️ Removing stroke from manager:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'erase':
          console.log('↩️ Undoing erase action by restoring strokes');
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              console.log('♻️ Restoring erased stroke:', stroke.id);
              strokeManager.restoreStroke(stroke);
            });
          }
          break;
        case 'fill':
          console.log('↩️ Undoing fill action');
          if (actionToUndo.data.previousBodyPartColors !== undefined) {
            console.log('🎨 Restoring previous colors:', actionToUndo.data.previousBodyPartColors);
            setBodyPartColors(actionToUndo.data.previousBodyPartColors);
          }
          break;
        case 'clear':
          console.log('↩️ Undoing clear action by restoring all cleared content');
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              console.log('♻️ Restoring cleared stroke:', stroke.id);
              strokeManager.restoreStroke(stroke);
            });
          }
          if (actionToUndo.data.previousBodyPartColors !== undefined) {
            console.log('🎨 Restoring cleared colors:', actionToUndo.data.previousBodyPartColors);
            setBodyPartColors(actionToUndo.data.previousBodyPartColors);
          }
          break;
        default:
          console.log('⚠️ Unknown action type to undo:', actionToUndo.type);
      }
    } catch (error) {
      console.error('❌ Error during undo operation:', error);
      // If undo fails, we should restore the action to history
      console.log('🔄 Restoring action to history due to error');
      actionHistory.redo(); // This will put the action back
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  const handleRedo = useCallback(() => {
    console.log('🔄 handleRedo called');
    const actionToRedo = actionHistory.redo();
    
    // If there's no action to redo for this user, return early
    if (!actionToRedo) {
      console.log('❌ No action to redo for current user');
      return null;
    }
    
    console.log('🔄 Action to redo:', actionToRedo?.type, actionToRedo?.id);
    
    try {
      switch (actionToRedo.type) {
        case 'draw':
          console.log('↪️ Redoing draw action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              console.log('♻️ Restoring stroke:', stroke.id);
              strokeManager.restoreStroke(stroke);
            });
          }
          break;
        case 'erase':
          console.log('↪️ Redoing erase action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              console.log('🗑️ Removing stroke again:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'fill':
          console.log('↪️ Redoing fill action');
          if (actionToRedo.data.bodyPartColors) {
            console.log('🎨 Applying colors again:', actionToRedo.data.bodyPartColors);
            setBodyPartColors(prev => ({
              ...prev,
              ...actionToRedo.data.bodyPartColors
            }));
          }
          break;
        case 'clear':
          console.log('↪️ Redoing clear action');
          if (actionToRedo.data.strokes) {
            actionToRedo.data.strokes.forEach(stroke => {
              console.log('🗑️ Removing stroke again:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            });
          }
          if (actionToRedo.data.bodyPartColors !== undefined) {
            console.log('🎨 Clearing colors again');
            setBodyPartColors({});
          }
          break;
        default:
          console.log('⚠️ Unknown action type to redo:', actionToRedo.type);
      }
    } catch (error) {
      console.error('❌ Error during redo operation:', error);
      // If redo fails, we should undo it back
      console.log('🔄 Undoing failed redo operation');
      actionHistory.undo(); // This will put the action back to undone state
    }
    
    return actionToRedo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  return {
    handleUndo,
    handleRedo
  };
};
