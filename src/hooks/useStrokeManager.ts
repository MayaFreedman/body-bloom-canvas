
import { useState, useCallback, useRef } from 'react';
import { DrawingStroke, DrawingMark as ActionDrawingMark } from '@/types/actionHistoryTypes';
import { DrawingMark } from '@/types/bodyMapperTypes';
import * as THREE from 'three';

interface UseStrokeManagerProps {
  currentUserId: string | null;
}

export const useStrokeManager = ({ currentUserId }: UseStrokeManagerProps) => {
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [completedStrokes, setCompletedStrokes] = useState<DrawingStroke[]>([]);

  const startStroke = useCallback((brushSize: number, color: string) => {
    if (!currentUserId) return null;

    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      marks: [],
      startTime: Date.now(),
      endTime: 0,
      brushSize,
      color,
      isComplete: false,
      userId: currentUserId
    };
    
    setCurrentStroke(newStroke);
    return newStroke.id;
  }, [currentUserId]);

  const addMarkToStroke = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp' | 'userId'>) => {
    console.log('🟡 useStrokeManager.addMarkToStroke received mark:', {id: mark.id, surface: mark.surface, hasAllProps: Object.keys(mark)});
    if (!currentStroke || !currentUserId) return null;

    const enhancedMark: ActionDrawingMark = {
      ...mark,
      strokeId: currentStroke.id,
      timestamp: Date.now(),
      userId: currentUserId
    };
    console.log('🟡 useStrokeManager.addMarkToStroke enhanced mark:', {id: enhancedMark.id, surface: enhancedMark.surface, hasAllProps: Object.keys(enhancedMark)});

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        marks: [...prev.marks, enhancedMark]
      };
    });

    return enhancedMark;
  }, [currentStroke, currentUserId]);

  const finishStroke = useCallback(() => {
    if (!currentStroke) return null;

    const completedStroke: DrawingStroke = {
      ...currentStroke,
      endTime: Date.now(),
      isComplete: true
    };

    setCompletedStrokes(prev => [...prev, completedStroke]);
    setCurrentStroke(null);
    
    return completedStroke;
  }, [currentStroke]);

  const removeStroke = useCallback((strokeId: string) => {
    setCompletedStrokes(prev => prev.filter(stroke => stroke.id !== strokeId));
  }, []);

  const restoreStroke = useCallback((stroke: DrawingStroke) => {
    console.log('Restoring stroke:', stroke.id);
    setCompletedStrokes(prev => {
      // Check if stroke already exists to avoid duplicates
      const exists = prev.some(s => s.id === stroke.id);
      if (exists) {
        console.log('Stroke already exists, skipping restore');
        return prev;
      }
      return [...prev, stroke];
    });
  }, []);

  const removeStrokesByUser = useCallback((userId: string) => {
    setCompletedStrokes(prev => prev.filter(stroke => stroke.userId !== userId));
  }, []);

  const getAllMarks = useCallback((): ActionDrawingMark[] => {
    const allMarks = completedStrokes.flatMap(stroke => stroke.marks);
    if (currentStroke) {
      allMarks.push(...currentStroke.marks);
    }
    return allMarks.sort((a, b) => a.timestamp - b.timestamp);
  }, [completedStrokes, currentStroke]);

  const getAllStrokes = useCallback((): DrawingStroke[] => {
    const allStrokes = [...completedStrokes];
    if (currentStroke) {
      allStrokes.push(currentStroke);
    }
    return allStrokes;
  }, [completedStrokes, currentStroke]);

  const getMarksByUser = useCallback((userId: string): ActionDrawingMark[] => {
    return getAllMarks().filter(mark => mark.userId === userId);
  }, [getAllMarks]);

  return {
    currentStroke,
    completedStrokes,
    startStroke,
    addMarkToStroke,
    finishStroke,
    removeStroke,
    restoreStroke,
    removeStrokesByUser,
    getAllMarks,
    getAllStrokes,
    getMarksByUser
  };
};
