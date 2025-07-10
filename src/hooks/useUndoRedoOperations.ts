
import { useCallback } from 'react';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { SensationMark } from '@/types/bodyMapperTypes';
import { TextMark } from '@/types/textTypes';

interface UseUndoRedoOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSensationMarks: React.Dispatch<React.SetStateAction<SensationMark[]>>;
  setTextMarks: React.Dispatch<React.SetStateAction<TextMark[]>>;
  setWhiteboardBackground?: React.Dispatch<React.SetStateAction<string>>;
  broadcastUndo?: () => void;
  broadcastRedo?: () => void;
  isMultiplayer?: boolean;
}

export const useUndoRedoOperations = ({
  strokeManager,
  actionHistory,
  setBodyPartColors,
  setSensationMarks,
  setTextMarks,
  setWhiteboardBackground,
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
        // Also restore any erased text marks
        if (actionToUndo.data.erasedTextMarks) {
          setTextMarks(prev => [...prev, ...actionToUndo.data.erasedTextMarks!]);
          console.log('Restored erased text marks from erase:', actionToUndo.data.erasedTextMarks);
        }
        // Also restore any erased sensation marks
        if (actionToUndo.data.erasedSensationMarks) {
          setSensationMarks(prev => [...prev, ...actionToUndo.data.erasedSensationMarks!]);
          console.log('Restored erased sensation marks from erase:', actionToUndo.data.erasedSensationMarks);
        }
        break;
      case 'fill':
        console.log('Undoing fill action');
        if (actionToUndo.data.previousBodyPartColors !== undefined) {
          setBodyPartColors(actionToUndo.data.previousBodyPartColors);
          console.log('Restored previous body part colors:', actionToUndo.data.previousBodyPartColors);
        }
        break;
      case 'whiteboardFill':
        console.log('Undoing whiteboard fill action');
        if (actionToUndo.data.previousColor !== undefined && setWhiteboardBackground) {
          setWhiteboardBackground(actionToUndo.data.previousColor);
          console.log('Restored previous whiteboard color:', actionToUndo.data.previousColor);
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
        if (actionToUndo.data.previousTextMarks !== undefined) {
          setTextMarks(actionToUndo.data.previousTextMarks);
          console.log('Restored previous text marks from clear:', actionToUndo.data.previousTextMarks);
        }
        // Also restore any erased text marks
        if (actionToUndo.data.erasedTextMarks) {
          setTextMarks(prev => [...prev, ...actionToUndo.data.erasedTextMarks!]);
          console.log('Restored erased text marks:', actionToUndo.data.erasedTextMarks);
        }
        break;
      case 'textPlace':
        console.log('Undoing text place action');
        if (actionToUndo.data.textMark) {
          setTextMarks(prev => prev.filter(mark => mark.id !== actionToUndo.data.textMark.id));
          console.log('Removed specific text mark:', actionToUndo.data.textMark.id);
        }
        break;
      case 'textEdit':
        console.log('Undoing text edit action');
        if (actionToUndo.data.textMark && actionToUndo.data.previousText !== undefined) {
          setTextMarks(prev => prev.map(mark => 
            mark.id === actionToUndo.data.textMark.id 
              ? { ...mark, text: actionToUndo.data.previousText }
              : mark
          ));
          console.log('Restored previous text content:', actionToUndo.data.previousText);
        }
        break;
      case 'textDelete':
        console.log('Undoing text delete action');
        if (actionToUndo.data.previousTextMarks !== undefined) {
          setTextMarks(actionToUndo.data.previousTextMarks);
          console.log('Restored text marks after delete undo:', actionToUndo.data.previousTextMarks);
        }
        break;
      case 'resetAll':
        console.log('Undoing reset all action');
        if (actionToUndo.data.drawingMarks) {
          actionToUndo.data.drawingMarks.forEach((mark: any) => {
            const stroke = {
              id: mark.strokeId,
              marks: [mark],
              startTime: mark.timestamp,
              endTime: mark.timestamp,
              brushSize: mark.size,
              color: mark.color,
              isComplete: true,
              userId: mark.userId
            };
            strokeManager.restoreStroke(stroke);
          });
        }
        if (actionToUndo.data.sensationMarks !== undefined) {
          setSensationMarks(actionToUndo.data.sensationMarks);
        }
        if (actionToUndo.data.bodyPartColors !== undefined) {
          setBodyPartColors(actionToUndo.data.bodyPartColors);
        }
        if (actionToUndo.data.textMarks !== undefined) {
          setTextMarks(actionToUndo.data.textMarks);
          console.log('Restored text marks from reset:', actionToUndo.data.textMarks);
        }
        break;
    }
  }, [strokeManager, setBodyPartColors, setSensationMarks, setTextMarks, setWhiteboardBackground]);

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
        // Also re-erase any text marks that were erased
        if (actionToRedo.data.erasedTextMarks) {
          actionToRedo.data.erasedTextMarks.forEach(textMark => {
            setTextMarks(prev => prev.filter(mark => mark.id !== textMark.id));
          });
          console.log('Re-erased text marks for erase redo:', actionToRedo.data.erasedTextMarks);
        }
        // Also re-erase any sensation marks that were erased
        if (actionToRedo.data.erasedSensationMarks) {
          actionToRedo.data.erasedSensationMarks.forEach(sensationMark => {
            setSensationMarks(prev => prev.filter(mark => mark.id !== sensationMark.id));
          });
          console.log('Re-erased sensation marks for erase redo:', actionToRedo.data.erasedSensationMarks);
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
      case 'whiteboardFill':
        console.log('Redoing whiteboard fill action');
        if (actionToRedo.data.newColor !== undefined && setWhiteboardBackground) {
          setWhiteboardBackground(actionToRedo.data.newColor);
          console.log('Applied whiteboard color after redo:', actionToRedo.data.newColor);
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
        if (actionToRedo.data.previousTextMarks !== undefined) {
          setTextMarks([]);
          console.log('Cleared text marks for clear redo');
        }
        // Also re-erase any text marks that were erased
        if (actionToRedo.data.erasedTextMarks) {
          actionToRedo.data.erasedTextMarks.forEach(textMark => {
            setTextMarks(prev => prev.filter(mark => mark.id !== textMark.id));
          });
          console.log('Re-erased text marks for clear redo:', actionToRedo.data.erasedTextMarks);
        }
        break;
      case 'textPlace':
        console.log('Redoing text place action');
        if (actionToRedo.data.textMark) {
          setTextMarks(prev => [...prev, actionToRedo.data.textMark]);
          console.log('Added text mark after redo:', actionToRedo.data.textMark);
        }
        break;
      case 'textEdit':
        console.log('Redoing text edit action');
        if (actionToRedo.data.textMark) {
          setTextMarks(prev => prev.map(mark => 
            mark.id === actionToRedo.data.textMark.id 
              ? { ...mark, text: actionToRedo.data.textMark.text }
              : mark
          ));
          console.log('Applied text edit after redo:', actionToRedo.data.textMark.text);
        }
        break;
      case 'textDelete':
        console.log('Redoing text delete action');
        if (actionToRedo.data.textMark) {
          setTextMarks(prev => prev.filter(mark => mark.id !== actionToRedo.data.textMark.id));
          console.log('Removed text mark after redo:', actionToRedo.data.textMark.id);
        }
        break;
      case 'resetAll':
        console.log('Redoing reset all action');
        // Clear everything again
        if (actionToRedo.data.drawingMarks) {
          actionToRedo.data.drawingMarks.forEach((mark: any) => {
            strokeManager.removeStroke(mark.strokeId);
          });
        }
        setSensationMarks([]);
        setBodyPartColors({});
        setTextMarks([]);
        console.log('Cleared all content after reset redo');
        break;
    }
  }, [strokeManager, setBodyPartColors, setSensationMarks, setTextMarks, setWhiteboardBackground]);

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
