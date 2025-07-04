
import { useCallback, useRef } from 'react';
import { StrokeKeyPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

export const useOptimizedStrokeProcessing = () => {
  const currentStrokePoints = useRef<StrokeKeyPoint[]>([]);
  const lastPointRef = useRef<StrokeKeyPoint | null>(null);

  const addStrokePoint = useCallback((worldPosition: THREE.Vector3, bodyPart: string) => {
    try {
      if (!worldPosition || typeof worldPosition.x !== 'number' || typeof worldPosition.y !== 'number' || typeof worldPosition.z !== 'number') {
        console.warn('⚠️ Invalid world position for stroke point:', worldPosition);
        return;
      }

      if (!bodyPart || typeof bodyPart !== 'string') {
        console.warn('⚠️ Invalid body part for stroke point:', bodyPart);
        return;
      }

      const newPoint: StrokeKeyPoint = {
        id: `point-${Date.now()}-${Math.random()}`,
        worldPosition: {
          x: worldPosition.x,
          y: worldPosition.y,
          z: worldPosition.z
        },
        bodyPart,
        timestamp: Date.now()
      };

      const shouldIncludePoint = (point: StrokeKeyPoint): boolean => {
        if (!lastPointRef.current) return true;
        
        const lastPoint = lastPointRef.current;
        const distance = Math.sqrt(
          Math.pow(point.worldPosition.x - lastPoint.worldPosition.x, 2) +
          Math.pow(point.worldPosition.y - lastPoint.worldPosition.y, 2) +
          Math.pow(point.worldPosition.z - lastPoint.worldPosition.z, 2)
        );
        
        const significantDistance = distance > 0.015;
        const bodyPartChange = point.bodyPart !== lastPoint.bodyPart;
        const timeGap = point.timestamp - lastPoint.timestamp > 80;
        
        return significantDistance || bodyPartChange || timeGap;
      };

      if (shouldIncludePoint(newPoint)) {
        currentStrokePoints.current.push(newPoint);
        lastPointRef.current = newPoint;
        console.log('🎨 Added key point to optimized stroke. Total points:', currentStrokePoints.current.length);
      }
    } catch (error) {
      console.error('❌ Error adding stroke point:', error);
    }
  }, []);

  const finalizeStroke = useCallback((color: string, size: number): OptimizedDrawingStroke | null => {
    try {
      if (currentStrokePoints.current.length === 0) {
        console.log('⚠️ No points to finalize stroke');
        return null;
      }

      if (!color || typeof color !== 'string') {
        console.warn('⚠️ Invalid color for stroke, using default');
        color = '#ff6b6b';
      }

      if (!size || typeof size !== 'number' || size <= 0) {
        console.warn('⚠️ Invalid size for stroke, using default');
        size = 3;
      }

      const keyPoints = [...currentStrokePoints.current];
      
      let totalLength = 0;
      for (let i = 1; i < keyPoints.length; i++) {
        const prev = keyPoints[i - 1];
        const curr = keyPoints[i];
        const distance = Math.sqrt(
          Math.pow(curr.worldPosition.x - prev.worldPosition.x, 2) +
          Math.pow(curr.worldPosition.y - prev.worldPosition.y, 2) +
          Math.pow(curr.worldPosition.z - prev.worldPosition.z, 2)
        );
        totalLength += distance;
      }

      const stroke: OptimizedDrawingStroke = {
        id: `optimized-stroke-${Date.now()}-${Math.random()}`,
        keyPoints,
        metadata: {
          color,
          size,
          startTime: keyPoints[0].timestamp,
          endTime: keyPoints[keyPoints.length - 1].timestamp,
          totalLength
        },
        playerId: ''
      };

      currentStrokePoints.current = [];
      lastPointRef.current = null;

      console.log('✅ Finalized optimized stroke with complete metadata:', {
        keyPointsCount: keyPoints.length,
        color: stroke.metadata.color,
        size: stroke.metadata.size,
        totalLength: stroke.metadata.totalLength
      });
      return stroke;
    } catch (error) {
      console.error('❌ Error finalizing stroke:', error);
      currentStrokePoints.current = [];
      lastPointRef.current = null;
      return null;
    }
  }, []);

  // Enhanced reconstruction that matches local smoothing exactly
  const getInterpolationStepCount = useCallback((brushSize: number, distance: number): number => {
    // This matches the exact logic from useDrawingMarks.ts
    let baseMultiplier;
    if (brushSize <= 3) {
      baseMultiplier = 150; // Tiny brushes get massive interpolation
    } else if (brushSize <= 5) {
      baseMultiplier = 120; // Small brushes get very high interpolation
    } else if (brushSize <= 8) {
      baseMultiplier = 90;  // Medium brushes get high interpolation
    } else if (brushSize <= 12) {
      baseMultiplier = 70;  // Larger brushes get good interpolation
    } else {
      baseMultiplier = 50;  // Largest brushes get moderate interpolation
    }
    
    const calculatedSteps = Math.floor(distance * baseMultiplier);
    
    // Match maximum limits exactly
    let maxSteps;
    if (brushSize <= 3) {
      maxSteps = 80;  // Tiny brushes can have up to 80 steps
    } else if (brushSize <= 5) {
      maxSteps = 60;  // Small brushes can have up to 60 steps
    } else if (brushSize <= 8) {
      maxSteps = 45;  // Medium brushes can have up to 45 steps
    } else if (brushSize <= 12) {
      maxSteps = 35;  // Larger brushes can have up to 35 steps
    } else {
      maxSteps = 25;  // Largest brushes can have up to 25 steps
    }
    
    return Math.max(1, Math.min(maxSteps, calculatedSteps));
  }, []);

  const reconstructStroke = useCallback((stroke: OptimizedDrawingStroke): THREE.Vector3[] => {
    try {
      if (!stroke || !stroke.keyPoints || !Array.isArray(stroke.keyPoints)) {
        console.warn('⚠️ Invalid stroke for reconstruction:', stroke);
        return [];
      }

      if (stroke.keyPoints.length === 0) {
        console.warn('⚠️ No key points to reconstruct');
        return [];
      }

      console.log('🎨 Reconstructing stroke with enhanced smoothing:', {
        keyPoints: stroke.keyPoints.length,
        color: stroke.metadata.color,
        size: stroke.metadata.size
      });

      if (stroke.keyPoints.length < 2) {
        const point = stroke.keyPoints[0];
        if (!point || !point.worldPosition) {
          console.warn('⚠️ Invalid single point:', point);
          return [];
        }
        return [new THREE.Vector3(
          point.worldPosition.x || 0,
          point.worldPosition.y || 0,
          point.worldPosition.z || 0
        )];
      }

      const reconstructedPoints: THREE.Vector3[] = [];
      const strokeSize = stroke.metadata.size || 3;
      
      for (let i = 0; i < stroke.keyPoints.length - 1; i++) {
        const currentKeyPoint = stroke.keyPoints[i];
        const nextKeyPoint = stroke.keyPoints[i + 1];
        
        if (!currentKeyPoint?.worldPosition || !nextKeyPoint?.worldPosition) {
          console.warn('⚠️ Invalid key points for interpolation:', currentKeyPoint, nextKeyPoint);
          continue;
        }

        const current = new THREE.Vector3(
          currentKeyPoint.worldPosition.x || 0,
          currentKeyPoint.worldPosition.y || 0,
          currentKeyPoint.worldPosition.z || 0
        );
        const next = new THREE.Vector3(
          nextKeyPoint.worldPosition.x || 0,
          nextKeyPoint.worldPosition.y || 0,
          nextKeyPoint.worldPosition.z || 0
        );

        reconstructedPoints.push(current);

        // Only interpolate between points on the same body part
        if (currentKeyPoint.bodyPart === nextKeyPoint.bodyPart) {
          const distance = current.distanceTo(next);
          const steps = getInterpolationStepCount(strokeSize, distance);
          
          console.log(`🎨 Interpolating ${steps} steps between key points (distance: ${distance.toFixed(3)}, size: ${strokeSize})`);
          
          if (steps > 1) {
            for (let j = 1; j < steps; j++) {
              const t = j / steps;
              // Use smoothstep function for identical smoothing to local version
              const smoothT = t * t * (3 - 2 * t);
              const interpolated = new THREE.Vector3().lerpVectors(current, next, smoothT);
              reconstructedPoints.push(interpolated);
            }
          }
        }
      }
      
      // Add the final point
      const lastPoint = stroke.keyPoints[stroke.keyPoints.length - 1];
      if (lastPoint?.worldPosition) {
        reconstructedPoints.push(new THREE.Vector3(
          lastPoint.worldPosition.x || 0,
          lastPoint.worldPosition.y || 0,
          lastPoint.worldPosition.z || 0
        ));
      }

      console.log('✅ Enhanced reconstruction complete:', {
        originalKeyPoints: stroke.keyPoints.length,
        reconstructedPoints: reconstructedPoints.length,
        smoothingRatio: (reconstructedPoints.length / stroke.keyPoints.length).toFixed(2),
        color: stroke.metadata.color,
        size: stroke.metadata.size
      });
      return reconstructedPoints;
    } catch (error) {
      console.error('❌ Error reconstructing stroke:', error);
      return [];
    }
  }, [getInterpolationStepCount]);

  const resetStroke = useCallback(() => {
    currentStrokePoints.current = [];
    lastPointRef.current = null;
    console.log('🔄 Reset optimized stroke processing');
  }, []);

  return {
    addStrokePoint,
    finalizeStroke,
    reconstructStroke,
    resetStroke
  };
};
