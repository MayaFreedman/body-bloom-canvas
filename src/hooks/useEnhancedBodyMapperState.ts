
import { useState, useEffect } from 'react';
import { BodyMapperMode, SelectedSensation, SensationMark } from '@/types/bodyMapperTypes';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';
import { useSpatialIndex } from './useSpatialIndex';
import { useDrawingOperations } from './useDrawingOperations';
import { useEraseOperations } from './useEraseOperations';
import { useUndoRedoOperations } from './useUndoRedoOperations';
import { useBodyPartOperations } from './useBodyPartOperations';

interface UseEnhancedBodyMapperStateProps {
  currentUserId: string | null;
}

export const useEnhancedBodyMapperState = ({ currentUserId }: UseEnhancedBodyMapperStateProps = { currentUserId: null }) => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([3]);
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>({});
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [rotation, setRotation] = useState(0);

  // Simplified global state management
  const actionHistory = useActionHistory();
  const strokeManager = useStrokeManager({ currentUserId });
  const spatialIndex = useSpatialIndex();

  // Specialized operation hooks
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
  
  const bodyPartOps = useBodyPartOperations({ 
    actionHistory, 
    strokeManager, 
    bodyPartColors, 
    setBodyPartColors, 
    currentUserId 
  });

  // Add sensation handling
  const handleSensationClick = (position: any, sensation: SelectedSensation) => {
    const newSensationMark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1
    };
    setSensationMarks(prev => [...prev, newSensationMark]);
    console.log('Added sensation mark:', newSensationMark);
  };

  const clearAll = () => {
    bodyPartOps.clearAll();
    setSensationMarks([]);
  };

  // Update spatial index when marks change
  useEffect(() => {
    const allMarks = strokeManager.getAllMarks();
    spatialIndex.buildSpatialIndex(allMarks);
  }, [strokeManager.completedStrokes, strokeManager.currentStroke]);

  // Legacy compatibility - convert to old format for existing components
  const drawingMarks = strokeManager.getAllMarks().map(mark => ({
    id: mark.id,
    position: mark.position,
    color: mark.color,
    size: mark.size
  }));

  return {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedSensation,
    setSelectedSensation,
    drawingMarks, // Legacy compatibility
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    rotation,
    setRotation,
    
    // Enhanced functionality
    handleStartDrawing: drawingOps.handleStartDrawing,
    handleAddDrawingMark: drawingOps.handleAddDrawingMark,
    handleFinishDrawing: drawingOps.handleFinishDrawing,
    handleSensationClick,
    handleErase: eraseOps.handleErase,
    handleUndo: undoRedoOps.handleUndo,
    handleRedo: undoRedoOps.handleRedo,
    handleIncomingUndo: undoRedoOps.handleIncomingUndo,
    handleIncomingRedo: undoRedoOps.handleIncomingRedo,
    handleBodyPartClick: bodyPartOps.handleBodyPartClick,
    clearAll,
    
    // State queries
    canUndo: actionHistory.canUndo,
    canRedo: actionHistory.canRedo,
    currentStroke: strokeManager.currentStroke,
    completedStrokes: strokeManager.completedStrokes,
    
    // Utility functions
    queryMarksInRadius: spatialIndex.queryRadius,
    queryMarksInBox: spatialIndex.queryBox,
    
    // User-specific functions (kept for drawing functionality)
    getUserMarks: strokeManager.getMarksByUser,
    clearUserHistory: actionHistory.clearHistory,
    
    // Expose restoreStroke for multiplayer
    restoreStroke: strokeManager.restoreStroke,
    
    // Add the missing addAction function
    addAction: actionHistory.addAction
  };
};
