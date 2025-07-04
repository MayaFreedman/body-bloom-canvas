
import { OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

export const getInterpolationStepCount = (brushSize: number, distance: number): number => {
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
};

export const reconstructStroke = (stroke: OptimizedDrawingStroke): THREE.Vector3[] => {
  try {
    if (!stroke || !stroke.keyPoints || !Array.isArray(stroke.keyPoints)) {
      console.warn('⚠️ Invalid stroke for reconstruction');
      return [];
    }

    if (stroke.keyPoints.length === 0) {
      return [];
    }

    if (stroke.keyPoints.length < 2) {
      const point = stroke.keyPoints[0];
      if (!point || !point.worldPosition) {
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

    return reconstructedPoints;
  } catch (error) {
    console.error('❌ Error reconstructing stroke:', error);
    return [];
  }
};
