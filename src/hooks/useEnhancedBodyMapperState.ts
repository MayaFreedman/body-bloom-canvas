
import { useState, useCallback, useMemo } from 'react';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';
import { useBodyPartOperations } from './useBodyPartOperations';
import { useSensationHandlers } from './useSensationHandlers';
import { useDrawingOperations } from './useDrawingOperations';
import { useEraseOperations } from './useEraseOperations';
import { useUndoRedoOperations } from './useUndoRedoOperations';
import { useSpatialIndex } from './useSpatialIndex';
import { 
  BodyMapperMode, 
  SelectedSensation, 
  SensationMark, 
  BodyPartColors,
  DrawingMark 
} from '@/types/bodyMapperTypes';
import { ActionHistoryItem } from '@/types/actionHistoryTypes';
import * as THREE from 'three';

interface UseEnhancedBodyMapperStateProps {
  currentUserId: string;
}

export const useEnhancedBodyMapperState = ({ currentUserId }: UseEnhancedBodyMapperStateProps) => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([3]);
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [bodyPartColors, setBodyPartColors] = useState<BodyPartColors>({});
  const [rotation, setRotation] = useState(0);

  const actionHistory = useActionHistory({ currentUserId });
  const strokeManager = useStrokeManager({ currentUserId });
  const spatialIndex = useSpatialIndex();
  
  const bodyPartOps = useBodyPartOperations({ 
    actionHistory,
    strokeManager,
    bodyPartColors,
    setBodyPartColors,
    currentUserId
  });
  
  const sensationOps = useSensationHandlers({ multiplayer: { isConnected: false } as any });
  
  const drawingOps = useDrawingOperations({ 
    strokeManager, 
    actionHistory,
    brushSize,
    selectedColor 
  });
  
  const eraseOps = useEraseOperations({ 
    strokeManager,
    actionHistory,
    spatialIndex,
    currentUserId
  });
  
  const undoRedoOps = useUndoRedoOperations({ 
    strokeManager,
    actionHistory,
    setBodyPartColors
  });

  // Convert action history to drawing marks with proper multiplayer support
  const drawingMarks = useMemo(() => {
    console.log('🎨 Converting action history to drawing marks, items:', actionHistory.items.length);
    const marks: DrawingMark[] = [];
    
    actionHistory.items.forEach((item: ActionHistoryItem) => {
      if (item.type === 'draw' && item.data.strokes) {
        item.data.strokes.forEach((stroke: any) => {
          if (stroke.marks && Array.isArray(stroke.marks)) {
            console.log('🎨 Processing stroke with', stroke.marks.length, 'marks, color:', stroke.color, 'from user:', stroke.userId);
            stroke.marks.forEach((mark: any) => {
              if (mark.position && mark.color && mark.size) {
                marks.push({
                  id: mark.id,
                  position: mark.position,
                  color: mark.color,
                  size: mark.size
                });
              }
            });
          }
        });
      }
    });
    
    console.log('🎨 Final drawing marks count:', marks.length);
    return marks;
  }, [actionHistory.items]);

  const handleStartDrawing = useCallback(() => {
    const strokeId = strokeManager.startStroke(brushSize[0], selectedColor);
    console.log('🎨 Started drawing stroke:', strokeId);
  }, [strokeManager, brushSize, selectedColor]);

  const handleAddDrawingMark = useCallback((mark: Omit<DrawingMark, 'id'>) => {
    const fullMark = strokeManager.addMarkToStroke({
      ...mark,
      id: `mark-${Date.now()}-${Math.random()}`
    });
    console.log('🎨 Added drawing mark:', fullMark?.id);
  }, [strokeManager]);

  const handleFinishDrawing = useCallback(() => {
    const completedStroke = strokeManager.finishStroke();
    if (completedStroke) {
      actionHistory.addAction({
        type: 'draw',
        data: { strokes: [completedStroke] },
        metadata: { brushSize: brushSize[0], color: selectedColor }
      });
      console.log('🎨 Completed drawing stroke with', completedStroke.marks.length, 'marks');
    }
  }, [strokeManager, actionHistory, brushSize, selectedColor]);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: SelectedSensation) => {
    const mark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1
    };
    setSensationMarks(prev => [...prev, mark]);
    
    // Store sensation marks separately in action history
    actionHistory.addAction({
      type: 'draw',
      data: { sensationMarks: [mark] },
      metadata: { color: sensation.color, sensation: sensation.name }
    });
  }, [actionHistory]);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    bodyPartOps.handleBodyPartClick(partName, color);
  }, [bodyPartOps]);

  const handleUndo = useCallback(() => {
    console.log('🔄 Undo requested, can undo:', actionHistory.canUndo);
    if (!actionHistory.canUndo) {
      console.log('❌ Cannot undo - no actions available');
      return;
    }
    
    const undoResult = undoRedoOps.handleUndo();
    if (undoResult) {
      console.log('✅ Undo completed for action:', undoResult.type);
      
      // Handle sensation marks for undo - check for sensationMarks in data
      if (undoResult.type === 'draw' && undoResult.data.sensationMarks) {
        setSensationMarks(prev => {
          const marksToRemove = undoResult.data.sensationMarks || [];
          return prev.filter(mark => !marksToRemove.some((m: SensationMark) => m.id === mark.id));
        });
      }
    }
  }, [undoRedoOps, actionHistory.canUndo]);

  const handleRedo = useCallback(() => {
    console.log('🔄 Redo requested, can redo:', actionHistory.canRedo);
    if (!actionHistory.canRedo) {
      console.log('❌ Cannot redo - no actions available');
      return;
    }
    
    const redoResult = undoRedoOps.handleRedo();
    if (redoResult) {
      console.log('✅ Redo completed for action:', redoResult.type);
      
      // Handle sensation marks for redo - check for sensationMarks in data
      if (redoResult.type === 'draw' && redoResult.data.sensationMarks) {
        const marksToAdd = redoResult.data.sensationMarks || [];
        marksToAdd.forEach((mark: SensationMark) => {
          setSensationMarks(prev => [...prev, mark]);
        });
      }
    }
  }, [undoRedoOps, actionHistory.canRedo]);

  const clearAll = useCallback(() => {
    console.log('🧹 clearAll called - removing ALL strokes and colors from ALL users');
    
    // Store current state for undo
    const allStrokes = strokeManager.completedStrokes;
    const previousColors = { ...bodyPartColors };
    const previousSensations = [...sensationMarks];
    
    console.log('🧹 Clearing', allStrokes.length, 'strokes from all users');
    console.log('🧹 Clearing colors:', Object.keys(previousColors).length, 'body parts');
    console.log('🧹 Clearing sensations:', previousSensations.length, 'sensation marks');
    
    // Clear everything
    strokeManager.clearAllStrokes();
    setBodyPartColors({});
    setSensationMarks([]);
    
    // Add clear action to history with all previous state
    actionHistory.addAction({
      type: 'clear',
      data: {
        strokes: allStrokes,
        bodyPartColors: {},
        previousBodyPartColors: previousColors,
        sensationMarks: previousSensations
      },
      metadata: { color: selectedColor }
    });
  }, [strokeManager, bodyPartColors, sensationMarks, actionHistory, selectedColor]);

  const addAction = useCallback((action: Omit<ActionHistoryItem, 'timestamp' | 'id' | 'userId'>) => {
    actionHistory.addAction(action);
  }, [actionHistory]);

  return {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedSensation,
    setSelectedSensation,
    drawingMarks,
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    rotation,
    setRotation,
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing,
    handleSensationClick,
    handleBodyPartClick,
    handleUndo,
    handleRedo,
    clearAll,
    canUndo: actionHistory.canUndo,
    canRedo: actionHistory.canRedo,
    addAction
  };
};
