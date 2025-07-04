
import { useCallback } from 'react';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';

interface UseUndoRedoOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  broadcastUndo?: () => void;
  broadcastRedo?: () => void;
  isMultiplayer?: boolean;
}

export const useUndoRedoOperations = ({
  strokeManager,
  actionHistory,
  setBodyPartColors,
  broadcastUndo,
  broadcastRedo,
  isMultiplayer = false
}: UseUndoRedoOperationsProps) => {
  const performUndo = useCallback((actionToUndo: any) => {
    if (!actionToUndo) return;

    console.log('Performing undo for action:', actionToUndo.type);
    
    switch (actionToUndo.type) {
      case 'draw':
        console.log('Undoing draw action with strokes:', actionToUndo.data.strokes);
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            console.log('Removing stroke:', stroke.id);
            strokeManager.removeStroke(stroke.id);
          });
        }
        break;
      case 'erase':
        console.log('Undoing erase action by restoring strokes');
        if (actionToUndo.data.strokes) {
          // Restore the erased strokes
          actionToUndo.data.strokes.forEach((stroke: any) => {
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
          actionToUndo.data.strokes.forEach((stroke: any) => {
            strokeManager.restoreStroke(stroke);
          });
        }
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
        }
        break;
    }
  }, [strokeManager, setBodyPartColors]);

  const performRedo = useCallback((actionToRedo: any) => {
    if (!actionToRedo) return;

    console.log('Performing redo for action:', actionToRedo.type);
    
    switch (actionToRedo.type) {
      case 'draw':
        console.log('Redoing draw action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            strokeManager.restoreStroke(stroke);
          });
        }
        break;
      case 'erase':
        console.log('Redoing erase action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
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
          actionToRedo.data.strokes.forEach((stroke: any) => {
            strokeManager.removeStroke(stroke.id);
          });
        }
        if (actionToRedo.data.bodyPartColors) {
          setBodyPartColors({});
        }
        break;
    }
  }, [strokeManager, setBodyPartColors]);

  const handleUndo = useCallback(() => {
    console.log('handleUndo called');
    const actionToUndo = actionHistory.undo();
    console.log('Action to undo:', actionToUndo);
    
    if (actionToUndo) {
      performUndo(actionToUndo);
      
      // Broadcast to multiplayer if connected
      if (isMultiplayer && broadcastUndo) {
        broadcastUndo();
      }
    }
    
    return actionToUndo;
  }, [actionHistory, performUndo, isMultiplayer, broadcastUndo]);

  const handleRedo = useCallback(() => {
    console.log('handleRedo called');
    const actionToRedo = actionHistory.redo();
    console.log('Action to redo:', actionToRedo);
    
    if (actionToRedo) {
      performRedo(actionToRedo);
      
      // Broadcast to multiplayer if connected
      if (isMultiplayer && broadcastRedo) {
        broadcastRedo();
      }
    }
    
    return actionToRedo;
  }, [actionHistory, performRedo, isMultiplayer, broadcastRedo]);

  // Handle incoming multiplayer undo/redo
  const handleIncomingUndo = useCallback(() => {
    console.log('Handling incoming multiplayer undo');
    const actionToUndo = actionHistory.undo();
    if (actionToUndo) {
      performUndo(actionToUndo);
    }
  }, [actionHistory, performUndo]);

  const handleIncomingRedo = useCallback(() => {
    console.log('Handling incoming multiplayer redo');
    const actionToRedo = actionHistory.redo();
    if (actionToRedo) {
      performRedo(actionToRedo);
    }
  }, [actionHistory, performRedo]);

  return {
    handleUndo,
    handleRedo,
    handleIncomingUndo,
    handleIncomingRedo
  };
};
