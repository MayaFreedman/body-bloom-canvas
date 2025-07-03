
import { useState, useCallback, useEffect } from 'react';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { DrawingMark, DrawingStroke, ActionHistoryItem } from '@/types/actionHistoryTypes';
import { useActionHistory } from './useActionHistory';
import { useStrokeManager } from './useStrokeManager';
import { useSpatialIndex } from './useSpatialIndex';
import * as THREE from 'three';

interface UseEnhancedBodyMapperStateProps {
  currentUserId: string | null;
}

export const useEnhancedBodyMapperState = ({ currentUserId }: UseEnhancedBodyMapperStateProps = { currentUserId: null }) => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([3]);
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [bodyPartColors, setBodyPartColors] = useState<Record<string, string>>({});
  const [rotation, setRotation] = useState(0);

  // Enhanced state management with user ID
  const actionHistory = useActionHistory({ currentUserId });
  const strokeManager = useStrokeManager({ currentUserId });
  const spatialIndex = useSpatialIndex();

  // Update spatial index when marks change
  useEffect(() => {
    const allMarks = strokeManager.getAllMarks();
    spatialIndex.buildSpatialIndex(allMarks);
  }, [strokeManager.completedStrokes, strokeManager.currentStroke]);

  const handleStartDrawing = useCallback(() => {
    const strokeId = strokeManager.startStroke(brushSize[0], selectedColor);
    return strokeId;
  }, [strokeManager, brushSize, selectedColor]);

  const handleAddDrawingMark = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp' | 'userId'>) => {
    const enhancedMark = strokeManager.addMarkToStroke(mark);
    return enhancedMark;
  }, [strokeManager]);

  const handleFinishDrawing = useCallback(() => {
    const completedStroke = strokeManager.finishStroke();
    
    if (completedStroke) {
      actionHistory.addAction({
        type: 'draw',
        data: {
          strokes: [completedStroke]
        },
        metadata: {
          brushSize: completedStroke.brushSize,
          color: completedStroke.color
        }
      });
    }
    
    return completedStroke;
  }, [strokeManager, actionHistory]);

  const handleErase = useCallback((center: THREE.Vector3, radius: number) => {
    const marksToErase = spatialIndex.queryRadius(center, radius);
    
    // Only erase marks created by the current user
    const userMarksToErase = marksToErase.filter(mark => mark.userId === currentUserId);
    
    if (userMarksToErase.length > 0) {
      // Remove strokes that contain erased marks
      const strokesToRemove = new Set<string>();
      userMarksToErase.forEach(mark => strokesToRemove.add(mark.strokeId));
      
      strokesToRemove.forEach(strokeId => {
        strokeManager.removeStroke(strokeId);
      });

      actionHistory.addAction({
        type: 'erase',
        data: {
          erasedMarks: userMarksToErase,
          affectedArea: { center, radius }
        }
      });
    }
    
    return userMarksToErase;
  }, [spatialIndex, strokeManager, actionHistory, currentUserId]);

  const handleUndo = useCallback(() => {
    const actionToUndo = actionHistory.undo();
    
    if (actionToUndo) {
      switch (actionToUndo.type) {
        case 'draw':
          if (actionToUndo.data.strokes) {
            actionToUndo.data.strokes.forEach(stroke => {
              strokeManager.removeStroke(stroke.id);
            });
          }
          break;
        case 'erase':
          // Re-add erased marks (would need to restore strokes)
          console.log('Undo erase not fully implemented yet');
          break;
        case 'fill':
          if (actionToUndo.data.bodyPartColors) {
            // Restore previous body part colors
            setBodyPartColors(prev => {
              const updated = { ...prev };
              Object.keys(actionToUndo.data.bodyPartColors!).forEach(part => {
                delete updated[part];
              });
              return updated;
            });
          }
          break;
      }
    }
    
    return actionToUndo;
  }, [actionHistory, strokeManager]);

  const handleRedo = useCallback(() => {
    const actionToRedo = actionHistory.redo();
    
    if (actionToRedo) {
      switch (actionToRedo.type) {
        case 'draw':
          if (actionToRedo.data.strokes) {
            // Re-add strokes (would need more complex state restoration)
            console.log('Redo draw not fully implemented yet');
          }
          break;
        case 'fill':
          if (actionToRedo.data.bodyPartColors) {
            setBodyPartColors(prev => ({
              ...prev,
              ...actionToRedo.data.bodyPartColors
            }));
          }
          break;
      }
    }
    
    return actionToRedo;
  }, [actionHistory]);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    const previousColor = bodyPartColors[partName];
    
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));

    actionHistory.addAction({
      type: 'fill',
      data: {
        bodyPartColors: { [partName]: color }
      },
      metadata: {
        bodyPart: partName,
        color: color
      }
    });
  }, [bodyPartColors, actionHistory]);

  const clearAll = useCallback(() => {
    // Only clear user's own strokes and body part fills
    const userStrokes = strokeManager.completedStrokes.filter(stroke => stroke.userId === currentUserId);
    
    strokeManager.removeStrokesByUser(currentUserId || '');
    
    // Note: Body part colors are global - might need different handling in multiplayer
    const currentColors = { ...bodyPartColors };
    setBodyPartColors({});

    actionHistory.addAction({
      type: 'clear',
      data: {
        strokes: userStrokes,
        bodyPartColors: currentColors
      }
    });
  }, [strokeManager, bodyPartColors, actionHistory, currentUserId]);

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
    bodyPartColors,
    rotation,
    setRotation,
    
    // Enhanced functionality
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing,
    handleErase,
    handleUndo,
    handleRedo,
    handleBodyPartClick,
    clearAll,
    
    // State queries
    canUndo: actionHistory.canUndo,
    canRedo: actionHistory.canRedo,
    currentStroke: strokeManager.currentStroke,
    completedStrokes: strokeManager.completedStrokes,
    
    // Utility functions
    queryMarksInRadius: spatialIndex.queryRadius,
    queryMarksInBox: spatialIndex.queryBox,
    
    // User-specific functions
    getUserMarks: strokeManager.getMarksByUser,
    clearUserHistory: actionHistory.clearUserHistory
  };
};
