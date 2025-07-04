
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
    console.log('🔄 Action to undo:', actionToUndo?.type, actionToUndo?.id);
    
    if (actionToUndo) {
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
      }
    } else {
      console.log('❌ No action to undo for current user');
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  const handleRedo = useCallback(() => {
    console.log('🔄 handleRedo called');
    const actionToRedo = actionHistory.redo();
    console.log('🔄 Action to redo:', actionToRedo?.type, actionToRedo?.id);
    
    if (actionToRedo) {
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
      }
    } else {
      console.log('❌ No action to redo for current user');
    }
    
    return actionToRedo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  return {
    handleUndo,
    handleRedo
  };
};
