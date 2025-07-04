
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

    console.log('Performing undo for action:', actionToUndo.type, 'ID:', actionToUndo.id);
    
    switch (actionToUndo.type) {
      case 'draw':
        console.log('Undoing draw action with strokes:', actionToUndo.data.strokes?.map(s => s.id));
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            // Only remove local strokes (not multiplayer strokes with mp- prefix)
            if (!stroke.id.startsWith('mp-')) {
              console.log('Removing LOCAL stroke:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            } else {
              console.log('Skipping MULTIPLAYER stroke:', stroke.id);
            }
          });
        }
        break;
      case 'erase':
        console.log('Undoing erase action by restoring strokes');
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            // Only restore local strokes
            if (!stroke.id.startsWith('mp-')) {
              console.log('Restoring LOCAL stroke:', stroke.id);
              strokeManager.restoreStroke(stroke);
            } else {
              console.log('Skipping restore of MULTIPLAYER stroke:', stroke.id);
            }
          });
        }
        break;
      case 'fill':
        console.log('Undoing fill action');
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
          console.log('Restored previous body part colors:', actionToUndo.data.previousBodyPartColors);
        }
        break;
      case 'clear':
        console.log('Undoing clear action by restoring all cleared content');
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            // Only restore local strokes
            if (!stroke.id.startsWith('mp-')) {
              console.log('Restoring LOCAL stroke from clear:', stroke.id);
              strokeManager.restoreStroke(stroke);
            } else {
              console.log('Skipping restore of MULTIPLAYER stroke from clear:', stroke.id);
            }
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

    console.log('Performing redo for action:', actionToRedo.type, 'ID:', actionToRedo.id);
    
    switch (actionToRedo.type) {
      case 'draw':
        console.log('Redoing draw action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            // Only restore local strokes
            if (!stroke.id.startsWith('mp-')) {
              console.log('Restoring LOCAL stroke for redo:', stroke.id);
              strokeManager.restoreStroke(stroke);
            } else {
              console.log('Skipping MULTIPLAYER stroke for redo:', stroke.id);
            }
          });
        }
        break;
      case 'erase':
        console.log('Redoing erase action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            // Only remove local strokes
            if (!stroke.id.startsWith('mp-')) {
              console.log('Removing LOCAL stroke for redo:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            } else {
              console.log('Skipping MULTIPLAYER stroke removal for redo:', stroke.id);
            }
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
            // Only remove local strokes
            if (!stroke.id.startsWith('mp-')) {
              console.log('Removing LOCAL stroke for clear redo:', stroke.id);
              strokeManager.removeStroke(stroke.id);
            } else {
              console.log('Skipping MULTIPLAYER stroke removal for clear redo:', stroke.id);
            }
          });
        }
        if (actionToRedo.data.bodyPartColors) {
          setBodyPartColors({});
        }
        break;
    }
  }, [strokeManager, setBodyPartColors]);

  const handleUndo = useCallback(() => {
    console.log('handleUndo called - LOCAL ACTION');
    const actionToUndo = actionHistory.undo();
    
    if (actionToUndo) {
      performUndo(actionToUndo);
      
      // Broadcast to multiplayer if connected (this will trigger performUndo on other clients)
      if (isMultiplayer && broadcastUndo) {
        console.log('Broadcasting undo to multiplayer');
        broadcastUndo();
      }
    }
    
    return actionToUndo;
  }, [actionHistory, performUndo, isMultiplayer, broadcastUndo]);

  const handleRedo = useCallback(() => {
    console.log('handleRedo called - LOCAL ACTION');
    const actionToRedo = actionHistory.redo();
    
    if (actionToRedo) {
      performRedo(actionToRedo);
      
      // Broadcast to multiplayer if connected (this will trigger performRedo on other clients)
      if (isMultiplayer && broadcastRedo) {
        console.log('Broadcasting redo to multiplayer');
        broadcastRedo();
      }
    }
    
    return actionToRedo;
  }, [actionHistory, performRedo, isMultiplayer, broadcastRedo]);

  // Handle incoming multiplayer undo/redo - only perform the operation, don't modify local history
  const handleIncomingUndo = useCallback(() => {
    console.log('Handling incoming multiplayer undo - REMOTE ACTION');
    const actionToUndo = actionHistory.undo();
    if (actionToUndo) {
      performUndo(actionToUndo);
    }
  }, [actionHistory, performUndo]);

  const handleIncomingRedo = useCallback(() => {
    console.log('Handling incoming multiplayer redo - REMOTE ACTION');  
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
