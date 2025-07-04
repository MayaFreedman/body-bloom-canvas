
import { useCallback, useRef } from 'react';
import { StrokeKeyPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';
import { validateStrokePoint, shouldIncludePoint } from '@/utils/strokeValidation';
import { reconstructStroke } from '@/utils/strokeReconstruction';
import { finalizeStroke } from '@/utils/strokeFinalization';

export const useOptimizedStrokeProcessing = () => {
  const currentStrokePoints = useRef<StrokeKeyPoint[]>([]);
  const lastPointRef = useRef<StrokeKeyPoint | null>(null);

  const addStrokePoint = useCallback((worldPosition: THREE.Vector3, bodyPart: string) => {
    const validatedPoint = validateStrokePoint(worldPosition, bodyPart);
    if (!validatedPoint) return;

    if (shouldIncludePoint(validatedPoint, lastPointRef.current)) {
      currentStrokePoints.current.push(validatedPoint);
      lastPointRef.current = validatedPoint;
      console.log('🎨 Added key point to optimized stroke. Total points:', currentStrokePoints.current.length);
    }
  }, []);

  const finalizeStrokeCallback = useCallback((color: string, size: number): OptimizedDrawingStroke | null => {
    const stroke = finalizeStroke(currentStrokePoints.current, color, size);
    currentStrokePoints.current = [];
    lastPointRef.current = null;
    return stroke;
  }, []);

  const resetStroke = useCallback(() => {
    currentStrokePoints.current = [];
    lastPointRef.current = null;
    console.log('🔄 Reset optimized stroke processing');
  }, []);

  return {
    addStrokePoint,
    finalizeStroke: finalizeStrokeCallback,
    reconstructStroke,
    resetStroke
  };
};
