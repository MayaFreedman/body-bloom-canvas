
import { useState, useEffect } from 'react';
import { BodyMapperMode, SelectedSensation, SensationMark, DrawingTarget } from '@/types/bodyMapperTypes';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';
import { useSpatialIndex } from './useSpatialIndex';
import { useDrawingOperations } from './useDrawingOperations';
import { useEraseOperations } from './useEraseOperations';
import { useUndoRedoOperations } from './useUndoRedoOperations';
import { useBodyPartOperations } from './useBodyPartOperations';
import { useTextManager } from './useTextManager';
import { TextSettings } from '@/types/textTypes';

interface UseEnhancedBodyMapperStateProps {
  currentUserId: string | null;
  isMultiplayer?: boolean;
  broadcastUndo?: () => void;
  broadcastRedo?: () => void;
  onBroadcastTextPlace?: (textMark: any) => void;
  onBroadcastTextUpdate?: (textMark: any) => void;
  onBroadcastTextDelete?: (textId: string) => void;
}

export const useEnhancedBodyMapperState = ({ 
  currentUserId,
  isMultiplayer = false,
  broadcastUndo,
  broadcastRedo,
  onBroadcastTextPlace,
  onBroadcastTextUpdate,
  onBroadcastTextDelete
}: UseEnhancedBodyMapperStateProps) => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ffeb3b'); // Changed from '#ff6b6b' to '#ffeb3b' (yellow)
  const [brushSize, setBrushSize] = useState([3]);
  const [drawingTarget, setDrawingTarget] = useState<DrawingTarget>('body');
  const [textToPlace, setTextToPlace] = useState('Sample Text');
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>({});
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isActivelyDrawing, setIsActivelyDrawing] = useState(false);

  // Centralized state management
  const actionHistory = useActionHistory();
  const strokeManager = useStrokeManager({ currentUserId });
  const spatialIndex = useSpatialIndex();

  // Specialized operation hooks with multiplayer support
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
    setBodyPartColors,
    setSensationMarks,
    broadcastUndo,
    broadcastRedo,
    isMultiplayer
  });
  
  const bodyPartOps = useBodyPartOperations({ 
    actionHistory, 
    strokeManager, 
    bodyPartColors, 
    setBodyPartColors, 
    currentUserId 
  });

  // Text Manager with multiplayer integration
  const textManager = useTextManager({
    currentUserId,
    onAddAction: actionHistory.addAction,
    onBroadcastTextPlace,
    onBroadcastTextUpdate,
    onBroadcastTextDelete
  });

  // Enhanced drawing handlers with state tracking
  const handleStartDrawing = () => {
    setIsActivelyDrawing(true);
    drawingOps.handleStartDrawing();
  };

  const handleFinishDrawing = () => {
    setIsActivelyDrawing(false);
    drawingOps.handleFinishDrawing();
  };

  // Enhanced sensation handling with action history tracking
  const handleSensationClick = (position: any, sensation: SelectedSensation) => {
    console.log('🎯 useEnhancedBodyMapperState - handleSensationClick called with:', sensation.name, 'at position:', position);
    
    const newSensationMark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1,
      name: sensation.name
    };
    
    // Update state
    console.log('🎯 useEnhancedBodyMapperState - About to add sensation mark:', newSensationMark);
    setSensationMarks(prev => {
      console.log('🎯 useEnhancedBodyMapperState - Previous sensation marks:', prev);
      const newMarks = [...prev, newSensationMark];
      console.log('🎯 useEnhancedBodyMapperState - New sensation marks:', newMarks);
      return newMarks;
    });
    
    // Add to action history for undo/redo
    actionHistory.addAction({
      type: 'sensation',
      data: {
        sensationMark: newSensationMark,
        previousSensationMarks: sensationMarks
      },
      metadata: {
        sensationType: sensation.name || sensation.icon
      }
    });
    
    console.log('Added sensation mark to history:', newSensationMark);
  };

  // Reset functionality that includes text marks
  const handleResetAll = () => {
    console.log('🔄 Resetting all content');
    
    // Get all current content for action history
    const allContent = {
      drawingMarks: [...strokeManager.completedStrokes.flatMap(stroke => stroke.marks)],
      sensationMarks: [...sensationMarks],
      bodyPartColors: { ...bodyPartColors },
      textMarks: [...textManager.textMarks]
    };
    
    // Clear everything using the existing clearAll method
    clearAll();
    
    // Also clear text marks
    textManager.clearAllText();
    
    // Record the reset action
    actionHistory.addAction({
      type: 'resetAll',
      data: allContent,
      metadata: {
        itemCount: allContent.drawingMarks.length + allContent.sensationMarks.length + allContent.textMarks.length + Object.keys(allContent.bodyPartColors).length
      }
    });
  };

  const clearAll = () => {
    const previousSensationMarks = [...sensationMarks];
    
    bodyPartOps.clearAll();
    setSensationMarks([]);
    
    // Record clear action including sensation marks
    if (previousSensationMarks.length > 0) {
      actionHistory.addAction({
        type: 'clear',
        data: {
          strokes: strokeManager.getAllStrokes(),
          previousBodyPartColors: bodyPartColors,
          previousSensationMarks: previousSensationMarks
        }
      });
    }
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
    size: mark.size,
    surface: mark.surface
  }));

  return {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    drawingTarget,
    setDrawingTarget,
    isActivelyDrawing,
    selectedSensation,
    setSelectedSensation,
    drawingMarks, // Legacy compatibility
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    rotation,
    setRotation,
    
    // Enhanced functionality
    handleStartDrawing,
    handleAddDrawingMark: drawingOps.handleAddDrawingMark,
    handleFinishDrawing,
    handleSensationClick,
    handleErase: eraseOps.handleErase,
    handleUndo: undoRedoOps.handleUndo,
    handleRedo: undoRedoOps.handleRedo,
    handleIncomingUndo: undoRedoOps.handleIncomingUndo,
    handleIncomingRedo: undoRedoOps.handleIncomingRedo,
    handleBodyPartClick: bodyPartOps.handleBodyPartClick,
    handleResetAll,
    clearAll,
    
    // Text functionality
    textMarks: textManager.textMarks,
    textSettings: textManager.textSettings,
    editingTextId: textManager.editingTextId,
    handleAddTextMark: textManager.addTextMark,
    handleUpdateTextMark: textManager.updateTextMark,
    handleDeleteTextMark: textManager.deleteTextMark,
    handleStartTextEditing: textManager.startEditing,
    handleStopTextEditing: textManager.stopEditing,
    setTextSettings: textManager.setTextSettings,
    textToPlace,
    setTextToPlace,
    
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
