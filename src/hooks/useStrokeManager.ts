
import { useState, useCallback } from 'react';
import { DrawingStroke, DrawingMark } from '@/types/actionHistoryTypes';

interface UseStrokeManagerProps {
  currentUserId: string | null;
}

export const useStrokeManager = ({ currentUserId }: UseStrokeManagerProps) => {
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [allStrokes, setAllStrokes] = useState<Map<string, DrawingStroke>>(new Map());

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
    
    console.log('🎨 Starting stroke:', newStroke.id);
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
    
    setAllStrokes(prev => new Map(prev).set(completedStroke.id, completedStroke));
    setCurrentStroke(null);
    
    return completedStroke;
  }, [currentStroke]);

  // Simple operations that work directly with the Map
  const addStroke = useCallback((stroke: DrawingStroke) => {
    console.log('➕ Adding stroke:', stroke.id);
    setAllStrokes(prev => new Map(prev).set(stroke.id, stroke));
  }, []);

  const removeStroke = useCallback((strokeId: string) => {
    console.log('🗑️ Removing stroke:', strokeId);
    setAllStrokes(prev => {
      const newMap = new Map(prev);
      const removed = newMap.delete(strokeId);
      console.log('🗑️ Stroke removal result:', removed ? 'SUCCESS' : 'NOT FOUND');
      console.log('🗑️ Strokes remaining:', newMap.size);
      return newMap;
    });
  }, []);

  const clearAllStrokes = useCallback(() => {
    console.log('🧹 Clearing all strokes');
    setAllStrokes(new Map());
    setCurrentStroke(null);
  }, []);

  // Convert Map to array for rendering
  const completedStrokes = Array.from(allStrokes.values());

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
    addStroke,
    removeStroke,
    clearAllStrokes,
    getAllMarks,
    getMarksByUser
  };
};
