
import { OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

export const getInterpolationStepCount = (brushSize: number, distance: number): number => {
  let baseMultiplier;
  if (brushSize <= 3) {
    baseMultiplier = 150;
  } else if (brushSize <= 5) {
    baseMultiplier = 120;
  } else if (brushSize <= 8) {
    baseMultiplier = 90;
  } else if (brushSize <= 12) {
    baseMultiplier = 70;
  } else {
    baseMultiplier = 50;
  }
  
  const calculatedSteps = Math.floor(distance * baseMultiplier);
  
  let maxSteps;
  if (brushSize <= 3) {
    maxSteps = 80;
  } else if (brushSize <= 5) {
    maxSteps = 60;
  } else if (brushSize <= 8) {
    maxSteps = 45;
  } else if (brushSize <= 12) {
    maxSteps = 35;
  } else {
    maxSteps = 25;
  }
  
  return Math.max(1, Math.min(maxSteps, calculatedSteps));
};

export const reconstructStroke = (stroke: OptimizedDrawingStroke): THREE.Vector3[] => {
  try {
    if (!stroke?.keyPoints?.length) {
      return [];
    }

    if (stroke.keyPoints.length === 1) {
      const point = stroke.keyPoints[0];
      if (!point?.worldPosition) {
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

      if (currentKeyPoint.bodyPart === nextKeyPoint.bodyPart) {
        const distance = current.distanceTo(next);
        const steps = getInterpolationStepCount(strokeSize, distance);
        
        if (steps > 1) {
          for (let j = 1; j < steps; j++) {
            const t = j / steps;
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
