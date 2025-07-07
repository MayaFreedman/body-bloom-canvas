
import { useCallback } from 'react';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { SensationMark } from '@/types/bodyMapperTypes';

interface UseUndoRedoOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSensationMarks: React.Dispatch<React.SetStateAction<SensationMark[]>>;
  broadcastUndo?: () => void;
  broadcastRedo?: () => void;
  isMultiplayer?: boolean;
}

export const useUndoRedoOperations = ({
  strokeManager,
  actionHistory,
  setBodyPartColors,
  setSensationMarks,
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
            console.log('Removing stroke:', stroke.id);
            strokeManager.removeStroke(stroke.id);
          });
        }
        break;
      case 'erase':
        console.log('Undoing erase action by restoring strokes');
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            console.log('Restoring stroke:', stroke.id);
            strokeManager.restoreStroke(stroke);
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
      case 'sensation':
        console.log('Undoing sensation action');
        if (actionToUndo.data.previousSensationMarks !== undefined) {
          setSensationMarks(actionToUndo.data.previousSensationMarks);
          console.log('Restored previous sensation marks:', actionToUndo.data.previousSensationMarks);
        }
        break;
      case 'clear':
        console.log('Undoing clear action by restoring all cleared content');
        if (actionToUndo.data.strokes) {
          actionToUndo.data.strokes.forEach((stroke: any) => {
            console.log('Restoring stroke from clear:', stroke.id);
            strokeManager.restoreStroke(stroke);
          });
        }
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
        }
        if (actionToUndo.data.previousSensationMarks !== undefined) {
          setSensationMarks(actionToUndo.data.previousSensationMarks);
        }
        break;
    }
  }, [strokeManager, setBodyPartColors, setSensationMarks]);

  const performRedo = useCallback((actionToRedo: any) => {
    if (!actionToRedo) return;

    console.log('Performing redo for action:', actionToRedo.type, 'ID:', actionToRedo.id);
    
    switch (actionToRedo.type) {
      case 'draw':
        console.log('Redoing draw action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            console.log('Restoring stroke for redo:', stroke.id);
            strokeManager.restoreStroke(stroke);
          });
        }
        break;
      case 'erase':
        console.log('Redoing erase action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            console.log('Removing stroke for redo:', stroke.id);
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
      case 'sensation':
        console.log('Redoing sensation action');
        if (actionToRedo.data.sensationMark) {
          setSensationMarks(prev => [...prev, actionToRedo.data.sensationMark]);
          console.log('Added sensation mark after redo:', actionToRedo.data.sensationMark);
        }
        break;
      case 'clear':
        console.log('Redoing clear action');
        if (actionToRedo.data.strokes) {
          actionToRedo.data.strokes.forEach((stroke: any) => {
            console.log('Removing stroke for clear redo:', stroke.id);
            strokeManager.removeStroke(stroke.id);
          });
        }
        if (actionToRedo.data.bodyPartColors) {
          setBodyPartColors({});
        }
        if (actionToRedo.data.previousSensationMarks !== undefined) {
          setSensationMarks([]);
        }
        break;
    }
  }, [strokeManager, setBodyPartColors, setSensationMarks]);

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
