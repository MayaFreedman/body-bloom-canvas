
import { useState, useCallback, useRef } from 'react';
import { DrawingStroke, DrawingMark } from '@/types/actionHistoryTypes';
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
    
    console.log('🎨 Starting new stroke:', newStroke.id, 'for user:', currentUserId);
    setCurrentStroke(newStroke);
    return newStroke.id;
  }, [currentUserId]);

  const addMarkToStroke = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp' | 'userId'>) => {
    if (!currentStroke || !currentUserId) return null;

    const enhancedMark: DrawingMark = {
      ...mark,
      strokeId: currentStroke.id,
      timestamp: Date.now(),
      userId: currentUserId
    };

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

    console.log('✅ Finishing stroke:', completedStroke.id, 'with', completedStroke.marks.length, 'marks');
    setCompletedStrokes(prev => [...prev, completedStroke]);
    setCurrentStroke(null);
    
    return completedStroke;
  }, [currentStroke]);

  const removeStroke = useCallback((strokeId: string) => {
    console.log('🗑️ Removing stroke:', strokeId);
    setCompletedStrokes(prev => {
      const filtered = prev.filter(stroke => stroke.id !== strokeId);
      console.log('🗑️ Strokes after removal:', filtered.length, '(was', prev.length, ')');
      return filtered;
    });
  }, []);

  const restoreStroke = useCallback((stroke: DrawingStroke) => {
    console.log('♻️ Restoring stroke:', stroke.id, 'with', stroke.marks?.length, 'marks');
    setCompletedStrokes(prev => {
      const exists = prev.some(s => s.id === stroke.id);
      if (exists) {
        console.log('♻️ Stroke already exists, skipping restore');
        return prev;
      }
      console.log('♻️ Stroke restored successfully');
      return [...prev, stroke];
    });
  }, []);

  const removeStrokesByUser = useCallback((userId: string) => {
    console.log('🗑️ Removing strokes for user:', userId);
    setCompletedStrokes(prev => {
      const filtered = prev.filter(stroke => stroke.userId !== userId);
      console.log('🗑️ Removed', prev.length - filtered.length, 'strokes for user:', userId);
      return filtered;
    });
  }, []);

  const clearAllStrokes = useCallback(() => {
    console.log('🧹 Clearing ALL strokes from ALL users');
    setCompletedStrokes([]);
    setCurrentStroke(null);
  }, []);

  const getAllMarks = useCallback((): DrawingMark[] => {
    const allMarks = completedStrokes.flatMap(stroke => stroke.marks || []);
    if (currentStroke) {
      allMarks.push(...(currentStroke.marks || []));
    }
    return allMarks.sort((a, b) => a.timestamp - b.timestamp);
  }, [completedStrokes, currentStroke]);

  const getMarksByUser = useCallback((userId: string): DrawingMark[] => {
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
    clearAllStrokes,
    getAllMarks,
    getMarksByUser
  };
};
