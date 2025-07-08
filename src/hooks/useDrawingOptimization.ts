import { useCallback, useRef } from 'react';
import { DrawingMark } from '@/types/bodyMapperTypes';

interface UseDrawingOptimizationProps {
  maxMarksPerSession?: number;
  cleanupThreshold?: number;
}

export const useDrawingOptimization = ({
  maxMarksPerSession = 5000, // Reasonable limit for performance
  cleanupThreshold = 4000
}: UseDrawingOptimizationProps = {}) => {
  const markCountRef = useRef(0);
  const lastCleanupRef = useRef(0);

  const shouldOptimize = useCallback((currentMarks: DrawingMark[]): boolean => {
    markCountRef.current = currentMarks.length;
    return markCountRef.current > cleanupThreshold;
  }, [cleanupThreshold]);

  const optimizeMarks = useCallback((marks: DrawingMark[]): DrawingMark[] => {
    if (marks.length <= cleanupThreshold) return marks;

    console.log(`🧹 Optimizing ${marks.length} marks for performance`);
    
    // Keep only the most recent marks and every Nth older mark
    const recentMarks = marks.slice(-1000); // Keep last 1000 marks
    const olderMarks = marks.slice(0, -1000);
    const sampledOlderMarks = olderMarks.filter((_, index) => index % 3 === 0); // Keep every 3rd older mark
    
    const optimizedMarks = [...sampledOlderMarks, ...recentMarks];
    console.log(`✅ Reduced from ${marks.length} to ${optimizedMarks.length} marks`);
    
    lastCleanupRef.current = Date.now();
    return optimizedMarks;
  }, [cleanupThreshold]);

  const shouldTriggerCleanup = useCallback((marks: DrawingMark[]): boolean => {
    const timeSinceLastCleanup = Date.now() - lastCleanupRef.current;
    return marks.length > maxMarksPerSession || (marks.length > cleanupThreshold && timeSinceLastCleanup > 30000);
  }, [maxMarksPerSession, cleanupThreshold]);

  return {
    shouldOptimize,
    optimizeMarks,
    shouldTriggerCleanup,
    markCount: markCountRef.current
  };
};
