
import { StrokeKeyPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

export const validateStrokePoint = (worldPosition: THREE.Vector3, bodyPart: string): StrokeKeyPoint | null => {
  try {
    if (!worldPosition || typeof worldPosition.x !== 'number' || typeof worldPosition.y !== 'number' || typeof worldPosition.z !== 'number') {
      console.warn('⚠️ Invalid world position for stroke point:', worldPosition);
      return null;
    }

    if (!bodyPart || typeof bodyPart !== 'string') {
      console.warn('⚠️ Invalid body part for stroke point:', bodyPart);
      return null;
    }

    return {
      id: `point-${Date.now()}-${Math.random()}`,
      worldPosition: {
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z
      },
      bodyPart,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('❌ Error validating stroke point:', error);
    return null;
  }
};

export const shouldIncludePoint = (newPoint: StrokeKeyPoint, lastPoint: StrokeKeyPoint | null): boolean => {
  if (!lastPoint) return true;
  
  const distance = Math.sqrt(
    Math.pow(newPoint.worldPosition.x - lastPoint.worldPosition.x, 2) +
    Math.pow(newPoint.worldPosition.y - lastPoint.worldPosition.y, 2) +
    Math.pow(newPoint.worldPosition.z - lastPoint.worldPosition.z, 2)
  );
  
  const significantDistance = distance > 0.015;
  const bodyPartChange = newPoint.bodyPart !== lastPoint.bodyPart;
  const timeGap = newPoint.timestamp - lastPoint.timestamp > 80;
  
  return significantDistance || bodyPartChange || timeGap;
};
