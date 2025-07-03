
import { useState, useCallback, useRef } from 'react';
import { DrawingStroke, DrawingMark } from '@/types/actionHistoryTypes';
import * as THREE from 'three';

export const useStrokeManager = () => {
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [completedStrokes, setCompletedStrokes] = useState<DrawingStroke[]>([]);

  const startStroke = useCallback((brushSize: number, color: string) => {
    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      marks: [],
      startTime: Date.now(),
      endTime: 0,
      brushSize,
      color,
      isComplete: false
    };
    
    setCurrentStroke(newStroke);
    return newStroke.id;
  }, []);

  const addMarkToStroke = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp'>) => {
    if (!currentStroke) return null;

    const enhancedMark: DrawingMark = {
      ...mark,
      strokeId: currentStroke.id,
      timestamp: Date.now()
    };

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        marks: [...prev.marks, enhancedMark]
      };
    });

    return enhancedMark;
  }, [currentStroke]);

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

  const getAllMarks = useCallback((): DrawingMark[] => {
    const allMarks = completedStrokes.flatMap(stroke => stroke.marks);
    if (currentStroke) {
      allMarks.push(...currentStroke.marks);
    }
    return allMarks.sort((a, b) => a.timestamp - b.timestamp);
  }, [completedStrokes, currentStroke]);

  return {
    currentStroke,
    completedStrokes,
    startStroke,
    addMarkToStroke,
    finishStroke,
    removeStroke,
    getAllMarks
  };
};
