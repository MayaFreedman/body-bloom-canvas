
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
import { useWhiteboardState } from './useWhiteboardState';
import { TextSettings } from '@/types/textTypes';
import * as THREE from 'three';

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
  const [selectedColor, setSelectedColor] = useState('#ff6b6b'); // Consistent with useBodyMapperState
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
  
  // Text Manager with multiplayer integration (moved up before eraseOps)
  const textManager = useTextManager({
    currentUserId,
    onAddAction: actionHistory.addAction,
    onBroadcastTextPlace,
    onBroadcastTextUpdate,
    onBroadcastTextDelete
  });

  // Whiteboard state management
  const whiteboardState = useWhiteboardState({
    selectedColor,
    brushSize: brushSize[0],
    onAddAction: actionHistory.addAction
  });

  const eraseOps = useEraseOperations({ 
    strokeManager, 
    actionHistory, 
    spatialIndex, 
    currentUserId,
    textMarks: () => textManager.textMarks,
    deleteTextMark: textManager.deleteTextMark,
    sensationMarks: () => sensationMarks,
    deleteSensationMark: (id: string) => setSensationMarks(prev => prev.filter(mark => mark.id !== id))
   });

  const undoRedoOps = useUndoRedoOperations({
    strokeManager,
    actionHistory,
    setBodyPartColors,
    setSensationMarks,
    setTextMarks: textManager.setTextMarks,
    setWhiteboardBackground: whiteboardState.setWhiteboardBackground,
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

  // Whiteboard fill handler - now delegated to whiteboard state
  const handleWhiteboardFill = whiteboardState.handleWhiteboardFill;

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
    
    // Reset selected sensation to null (unequip)
    setSelectedSensation(null);
    
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
    const previousTextMarks = [...textManager.textMarks];
    const previousWhiteboardColor = whiteboardState.whiteboardBackground;
    
    bodyPartOps.clearAll();
    setSensationMarks([]);
    textManager.clearAllText();
    whiteboardState.clearWhiteboardMarks();
    whiteboardState.setWhiteboardBackground('white');
    
    // Record clear action including sensation marks and text marks
    if (previousSensationMarks.length > 0 || previousTextMarks.length > 0 || previousWhiteboardColor !== 'white') {
      actionHistory.addAction({
        type: 'clear',
        data: {
          strokes: strokeManager.getAllStrokes(),
          previousBodyPartColors: bodyPartColors,
          previousSensationMarks: previousSensationMarks,
          previousTextMarks: previousTextMarks
        }
      });
    }
  };

  // Update spatial index when marks change
  useEffect(() => {
    const allMarks = strokeManager.getAllMarks();
    spatialIndex.buildSpatialIndex(allMarks);
  }, [strokeManager.completedStrokes, strokeManager.currentStroke, textManager.textMarks]);

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
    
    // Whiteboard state
    whiteboardMarks: whiteboardState.whiteboardMarks,
    whiteboardBackground: whiteboardState.whiteboardBackground,
    setWhiteboardBackground: whiteboardState.setWhiteboardBackground,
    
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
    handleWhiteboardFill,
    handleResetAll,
    clearAll,
    
    // Whiteboard handlers
    handleWhiteboardPointerDown: whiteboardState.handleWhiteboardPointerDown,
    handleWhiteboardPointerMove: whiteboardState.handleWhiteboardPointerMove,
    handleWhiteboardPointerUp: whiteboardState.handleWhiteboardPointerUp,
    eraseWhiteboardMarks: whiteboardState.eraseWhiteboardMarks,
    
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
