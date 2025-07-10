
import { useState, useEffect, useCallback } from 'react';
import { BodyMapperMode, SelectedSensation, SensationMark, DrawingTarget, DrawingMark } from '@/types/bodyMapperTypes';
import { CustomSensation } from '@/types/customEffectTypes';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';
import { useSpatialIndex } from './useSpatialIndex';
import { useDrawingOperations } from './useDrawingOperations';
import { useEraseOperations } from './useEraseOperations';
import { useUndoRedoOperations } from './useUndoRedoOperations';
import { useBodyPartOperations } from './useBodyPartOperations';
import { useTextManager } from './useTextManager';
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
  const [selectedColor, setSelectedColor] = useState('#ffeb3b'); // Changed from '#ff6b6b' to '#ffeb3b' (yellow)
  const [brushSize, setBrushSize] = useState([3]);
  const [drawingTarget, setDrawingTarget] = useState<DrawingTarget>('body');
  const [textToPlace, setTextToPlace] = useState('');
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);

  // Custom sensation selection handler that manages mode
  const handleSensationSelection = useCallback((sensation: SelectedSensation | null) => {
    setSelectedSensation(sensation);
    if (sensation) {
      // When a sensation is selected, switch to sensation mode
      setMode('sensation');
    }
    // Note: We don't automatically switch away from sensation mode when deselecting
    // to allow user to manually choose their next mode
  }, []);
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>({});
  const [whiteboardBackground, setWhiteboardBackground] = useState('white');
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
    setWhiteboardBackground,
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
    console.log('🎬 ENHANCED STATE: handleStartDrawing called - mode:', mode, 'activelyDrawing:', isActivelyDrawing);
    setIsActivelyDrawing(true);
    drawingOps.handleStartDrawing();
  };

  const handleFinishDrawing = () => {
    console.log('🏁 ENHANCED STATE: handleFinishDrawing called - mode:', mode, 'activelyDrawing:', isActivelyDrawing);
    setIsActivelyDrawing(false);
    drawingOps.handleFinishDrawing();
  };

  // Enhanced sensation handling with action history tracking
  const handleSensationClick = (position: any, sensation: SelectedSensation | CustomSensation) => {
    console.log('🔥 LOCAL SENSATION: useEnhancedBodyMapperState - handleSensationClick called with:', sensation.name, 'at position:', position);
    
    // Create enhanced sensation mark with custom properties
    const newSensationMark: SensationMark & { 
      movementBehavior?: 'gentle' | 'moderate' | 'energetic';
      isCustom?: boolean;
    } = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: ('isCustom' in sensation && sensation.isCustom) 
        ? (sensation as CustomSensation).selectedIcon  // Use selectedIcon for custom effects
        : sensation.icon,                              // Use icon for built-in sensations
      color: sensation.color,
      size: 0.1,
      name: sensation.name,
      ...(('isCustom' in sensation && sensation.isCustom) ? {
        movementBehavior: sensation.movementBehavior,
        isCustom: true
      } : {})
    };
    
    // Update state
    console.log('🎯 Custom effect data being stored:', {
      sensationName: sensation.name,
      sensationIcon: sensation.icon,
      isCustomSensation: 'isCustom' in sensation && sensation.isCustom,
      customIcon: ('isCustom' in sensation && sensation.isCustom) ? (sensation as any).selectedIcon : undefined,
      finalIconValue: ('isCustom' in sensation && sensation.isCustom) 
        ? (sensation as CustomSensation).selectedIcon  
        : sensation.icon
    });
    console.log('🎯 useEnhancedBodyMapperState - About to add sensation mark:', newSensationMark);
    setSensationMarks(prev => {
      console.log('🎯 useEnhancedBodyMapperState - Previous sensation marks:', prev);
      const newMarks = [...prev, newSensationMark];
      console.log('🎯 useEnhancedBodyMapperState - New sensation marks:', newMarks);
      console.log('🎯 useEnhancedBodyMapperState - New mark details:', {
        id: newSensationMark.id,
        icon: newSensationMark.icon,
        isCustom: newSensationMark.isCustom,
        name: newSensationMark.name,
        color: newSensationMark.color,
        movementBehavior: (newSensationMark as any).movementBehavior
      });
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

  // Whiteboard fill handler
  const handleWhiteboardFill = (color: string) => {
    console.log('🎨 useEnhancedBodyMapperState - Filling whiteboard with color:', color);
    
    const previousColor = whiteboardBackground;
    setWhiteboardBackground(color);
    
    // Add to action history for undo/redo
    actionHistory.addAction({
      type: 'whiteboardFill',
      data: {
        newColor: color,
        previousColor: previousColor
      },
      metadata: {
        fillColor: color
      }
    });
  };

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
    handleSensationSelection(null);
    
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
    const previousWhiteboardColor = whiteboardBackground;
    
    bodyPartOps.clearAll();
    setSensationMarks([]);
    textManager.clearAllText();
    setWhiteboardBackground('white');
    
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
  const drawingMarks = strokeManager.getAllMarks().map(mark => {
    console.log('🟢 Converting stroke mark to drawing mark:', {id: mark.id, surface: mark.surface, hasAllProps: Object.keys(mark)});
    return {
      id: mark.id,
      position: mark.position,
      color: mark.color,
      size: mark.size,
      surface: mark.surface
    };
  });
  console.log('🟢 Final drawingMarks array:', drawingMarks.length, 'marks with surfaces:', drawingMarks.map(m => ({id: m.id, surface: m.surface})));

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
    setSelectedSensation: handleSensationSelection,
    drawingMarks, // Legacy compatibility
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    whiteboardBackground,
    setWhiteboardBackground,
    rotation,
    setRotation,
    
    // Enhanced functionality
    handleStartDrawing,
    handleAddDrawingMark: useCallback((mark: DrawingMark) => {
      console.log('🟣 useEnhancedBodyMapperState.handleAddDrawingMark received mark:', {id: mark.id, surface: mark.surface, hasAllProps: Object.keys(mark)});
      
      // Add to stroke for action history
      const enhancedMark = drawingOps.handleAddDrawingMark(mark);
      
      console.log('🟣 Mark successfully processed by drawingOps, enhancedMark:', enhancedMark);
      
      return enhancedMark;
    }, [drawingOps.handleAddDrawingMark]),
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
