
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
    console.log('🔄 HandleUndo called');
    const actionToUndo = actionHistory.undo();
    
    if (!actionToUndo) {
      console.log('❌ No action to undo');
      return null;
    }
    
    console.log('🔄 Processing undo for:', actionToUndo.type);
    
    switch (actionToUndo.type) {
      case 'draw':
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach(stroke => {
            console.log('🗑️ Undoing draw - removing stroke:', stroke.id);
            strokeManager.removeStroke(stroke.id);
          });
        }
        break;
      case 'erase':
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach(stroke => {
            console.log('♻️ Undoing erase - restoring stroke:', stroke.id);
            strokeManager.addStroke(stroke);
          });
        }
        break;
      case 'fill':
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          console.log('🎨 Undoing fill - restoring colors');
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
        }
        break;
      case 'clear':
        console.log('♻️ Undoing clear - restoring all content');
        // Restore all strokes
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach(stroke => {
            console.log('♻️ Restoring stroke:', stroke.id);
            strokeManager.addStroke(stroke);
          });
        }
        // Restore body part colors
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          console.log('🎨 Restoring body part colors');
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
        }
        break;
      default:
        console.log('⚠️ Unknown undo action:', actionToUndo.type);
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  const handleRedo = useCallback(() => {
    console.log('🔄 HandleRedo called');
    const actionToRedo = actionHistory.redo();
    
    if (!actionToRedo) {
      console.log('❌ No action to redo');
      return null;
    }
    
    console.log('🔄 Processing redo for:', actionToRedo.type);
    
    switch (actionToRedo.type) {
      case 'draw':
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach(stroke => {
            console.log('♻️ Redoing draw - adding stroke:', stroke.id);
            strokeManager.addStroke(stroke);
          });
        }
        break;
      case 'erase':
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach(stroke => {
            console.log('🗑️ Redoing erase - removing stroke:', stroke.id);
            strokeManager.removeStroke(stroke.id);
          });
        }
        break;
      case 'fill':
        if (actionToRedo.data.bodyPartColors) {
          console.log('🎨 Redoing fill');
          setBodyPartColors(prev => ({
            ...prev,
            ...actionToRedo.data.bodyPartColors
          }));
        }
        break;
      case 'clear':
        console.log('🧹 Redoing clear - removing all content');
        // Clear all strokes
        strokeManager.clearAllStrokes();
        // Clear body part colors  
        setBodyPartColors({});
        break;
      default:
        console.log('⚠️ Unknown redo action:', actionToRedo.type);
    }
    
    return actionToRedo;
  }, [actionHistory, strokeManager, setBodyPartColors]);

  return {
    handleUndo,
    handleRedo
  };
};
