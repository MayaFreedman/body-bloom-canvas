
import { useCallback, useRef } from 'react';
import { StrokeKeyPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';
import { validateStrokePoint, shouldIncludePoint } from '@/utils/strokeValidation';
import { reconstructStroke } from '@/utils/strokeReconstruction';
import { finalizeStroke } from '@/utils/strokeFinalization';

export const useOptimizedStrokeProcessing = () => {
  const currentStrokePoints = useRef<StrokeKeyPoint[]>([]);
  const lastPointRef = useRef<StrokeKeyPoint | null>(null);

  const addStrokePoint = useCallback((worldPosition: THREE.Vector3, bodyPart?: string, whiteboardRegion?: string) => {
    // Create point based on surface type
    const surface: 'body' | 'whiteboard' = bodyPart ? 'body' : 'whiteboard';
    
    const validatedPoint: StrokeKeyPoint = {
      id: `key-${Date.now()}-${Math.random()}`,
      worldPosition: {
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z
      },
      bodyPart: bodyPart,
      whiteboardRegion: whiteboardRegion,
      surface: surface,
      timestamp: Date.now()
    };

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
