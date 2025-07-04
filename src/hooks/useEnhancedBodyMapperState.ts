import { useState, useCallback, useRef, useEffect } from 'react';
import { DrawingMark, SensationMark, Effect, BodyPartColors, BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { useDrawingOptimization } from './useDrawingOptimization';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';
import { useSpatialIndex } from './useSpatialIndex';
import { useEraseOperations } from './useEraseOperations';
import * as THREE from 'three';

interface UseEnhancedBodyMapperStateProps {
  currentUserId: string | null;
  isMultiplayer?: boolean;
  broadcastUndo?: () => void;
  broadcastRedo?: () => void;
}

export const useEnhancedBodyMapperState = ({ 
  currentUserId,
  isMultiplayer = false,
  broadcastUndo,
  broadcastRedo
}: UseEnhancedBodyMapperStateProps) => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([3]); // Changed from 10 to 3 (new minimum)
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [drawingMarks, setDrawingMarks] = useState<DrawingMark[]>([]);
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [bodyPartColors, setBodyPartColors] = useState<BodyPartColors>({});
  const [rotation, setRotation] = useState(0);

  const strokeManager = useStrokeManager({ currentUserId });
  const actionHistory = useActionHistory();
  const spatialIndex = useSpatialIndex();

  // Add performance optimization
  const optimization = useDrawingOptimization();

  // Initialize erase operations hook
  const eraseOperations = useEraseOperations({
    strokeManager,
    actionHistory,
    spatialIndex,
    currentUserId
  });

  // Initialize spatial index and rebuild it whenever marks change
  useEffect(() => {
    console.log('🔧 SPATIAL INDEX: Rebuilding with', strokeManager.getAllMarks().length, 'marks');
    spatialIndex.buildSpatialIndex(strokeManager.getAllMarks());
  }, [strokeManager.completedStrokes, strokeManager.currentStroke, spatialIndex]);

  const handleStartDrawing = useCallback(() => {
    console.log('Starting a new stroke');
    strokeManager.startStroke(brushSize[0], selectedColor);
  }, [brushSize, selectedColor, strokeManager]);

  const handleAddDrawingMark = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp' | 'userId'>) => {
    const enhancedMark = strokeManager.addMarkToStroke(mark);
    if (enhancedMark) {
      setDrawingMarks(prev => {
        const newMarks = [...prev, enhancedMark];
        
        // Auto-optimize if we have too many marks
        if (optimization.shouldTriggerCleanup(newMarks)) {
          return optimization.optimizeMarks(newMarks);
        }
        
        return newMarks;
      });
    }
  }, [optimization, strokeManager, setDrawingMarks]);

  const handleFinishDrawing = useCallback(() => {
    const completedStroke = strokeManager.finishStroke();
    if (completedStroke) {
      console.log('Stroke completed:', completedStroke.id, 'with', completedStroke.marks.length, 'marks');
    }
  }, [strokeManager]);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));
  }, []);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: SelectedSensation) => {
    const newSensationMark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1
    };
    setSensationMarks(prev => [...prev, newSensationMark]);
  }, []);

  const handleErase = useCallback((center: THREE.Vector3, radius: number) => {
    console.log('Erasing marks at', center, 'with radius', radius);
    return eraseOperations.handleErase(center, radius);
  }, [eraseOperations]);

  const handleUndo = useCallback(() => {
    console.log('Undoing last action');
    const actionToUndo = actionHistory.undo();
    if (actionToUndo) {
      console.log('Action to undo:', actionToUndo.type);
      switch (actionToUndo.type) {
        case 'erase':
          console.log('Restoring strokes:', actionToUndo.data.strokes.length);
          actionToUndo.data.strokes.forEach(stroke => {
            strokeManager.restoreStroke(stroke);
          });
          break;
        default:
          console.log('Unknown action type to undo:', actionToUndo.type);
      }
      if (isMultiplayer && broadcastUndo) {
        broadcastUndo();
      }
    }
  }, [actionHistory, strokeManager, isMultiplayer, broadcastUndo]);

  const handleRedo = useCallback(() => {
    console.log('Redoing last action');
    const actionToRedo = actionHistory.redo();
    if (actionToRedo) {
       console.log('Action to redo:', actionToRedo.type);
      switch (actionToRedo.type) {
        case 'erase':
          console.log('Removing strokes:', actionToRedo.data.strokes.length);
          actionToRedo.data.strokes.forEach(stroke => {
            strokeManager.removeStroke(stroke.id);
          });
          break;
        default:
          console.log('Unknown action type to redo:', actionToRedo.type);
      }
      if (isMultiplayer && broadcastRedo) {
        broadcastRedo();
      }
    }
  }, [actionHistory, strokeManager, isMultiplayer, broadcastRedo]);

  const handleIncomingUndo = useCallback(() => {
    console.log('Handling incoming undo action');
    const actionToUndo = actionHistory.undo();
    if (actionToUndo) {
      console.log('Action to undo:', actionToUndo.type);
      switch (actionToUndo.type) {
        case 'erase':
          console.log('Restoring strokes:', actionToUndo.data.strokes.length);
          actionToUndo.data.strokes.forEach(stroke => {
            strokeManager.restoreStroke(stroke);
          });
          break;
        default:
          console.log('Unknown action type to undo:', actionToUndo.type);
      }
    }
  }, [actionHistory, strokeManager]);

  const handleIncomingRedo = useCallback(() => {
    console.log('Handling incoming redo action');
    const actionToRedo = actionHistory.redo();
     if (actionToRedo) {
       console.log('Action to redo:', actionToRedo.type);
      switch (actionToRedo.type) {
        case 'erase':
          console.log('Removing strokes:', actionToRedo.data.strokes.length);
          actionToRedo.data.strokes.forEach(stroke => {
            strokeManager.removeStroke(stroke.id);
          });
          break;
        default:
          console.log('Unknown action type to redo:', actionToRedo.type);
      }
    }
  }, [actionHistory, strokeManager]);

  const rotateLeft = useCallback(() => {
    setRotation(prev => prev - Math.PI / 2);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation(prev => prev + Math.PI / 2);
  }, []);

  const clearAll = useCallback(() => {
    console.log('Clearing all drawings and sensations');
    setDrawingMarks([]);
    setEffects([]);
    setBodyPartColors({});
    setSensationMarks([]);
    strokeManager.completedStrokes.forEach(stroke => {
      strokeManager.removeStroke(stroke.id);
    });
    actionHistory.clearHistory();
  }, [strokeManager, actionHistory]);

  const canUndo = actionHistory.canUndo;
  const canRedo = actionHistory.canRedo;

  const restoreStroke = useCallback((stroke: any) => {
    strokeManager.restoreStroke(stroke);
  }, [strokeManager]);

  const addAction = useCallback((action: any) => {
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
    setDrawingMarks,
    sensationMarks,
    setSensationMarks,
    effects,
    setEffects,
    bodyPartColors,
    setBodyPartColors,
    rotation,
    setRotation,
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing,
    handleBodyPartClick,
    handleSensationClick,
    handleErase,
    handleUndo,
    handleRedo,
    handleIncomingUndo,
    handleIncomingRedo,
    rotateLeft,
    rotateRight,
    clearAll,
    canUndo,
    canRedo,
    restoreStroke,
    addAction
  };
};
