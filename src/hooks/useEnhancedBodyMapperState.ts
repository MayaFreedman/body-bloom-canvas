
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
    
    actionHistory.addAction({
      type: 'draw',
      data: { marks: [mark as any] },
      metadata: { color: sensation.color }
    });
  }, [actionHistory]);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    bodyPartOps.handleBodyPartClick(partName, color);
  }, [bodyPartOps]);

  const handleUndo = useCallback(() => {
    undoRedoOps.handleUndo();
  }, [undoRedoOps]);

  const handleRedo = useCallback(() => {
    undoRedoOps.handleRedo();
  }, [undoRedoOps]);

  const clearAll = useCallback(() => {
    console.log('🧹 clearAll called - removing ALL strokes and colors from ALL users');
    
    // Use the completed strokes from stroke manager
    const allStrokes = strokeManager.completedStrokes;
    console.log('🧹 Clearing', allStrokes.length, 'strokes from all users');
    
    const colorCount = Object.keys(bodyPartColors).length;
    console.log('🧹 Clearing colors:', colorCount, 'body parts');
    
    strokeManager.clearAllStrokes();
    setBodyPartColors({});
    setSensationMarks([]);
    
    actionHistory.addAction({
      type: 'clear',
      data: {},
      metadata: { color: selectedColor }
    });
  }, [strokeManager, bodyPartColors, actionHistory, selectedColor]);

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
