
import { useCallback, useRef } from 'react';
import { StrokeKeyPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

export const useOptimizedStrokeProcessing = () => {
  const currentStrokePoints = useRef<StrokeKeyPoint[]>([]);
  const lastPointRef = useRef<StrokeKeyPoint | null>(null);

  const addStrokePoint = useCallback((worldPosition: THREE.Vector3, bodyPart: string) => {
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

    // Smart point selection logic
    const shouldIncludePoint = (point: StrokeKeyPoint): boolean => {
      if (!lastPointRef.current) return true; // Always include first point
      
      const lastPoint = lastPointRef.current;
      const distance = Math.sqrt(
        Math.pow(point.worldPosition.x - lastPoint.worldPosition.x, 2) +
        Math.pow(point.worldPosition.y - lastPoint.worldPosition.y, 2) +
        Math.pow(point.worldPosition.z - lastPoint.worldPosition.z, 2)
      );
      
      // Include point if:
      // 1. Significant distance from last point
      // 2. Body part change
      // 3. Time gap (direction change indicator)
      const significantDistance = distance > 0.02;
      const bodyPartChange = point.bodyPart !== lastPoint.bodyPart;
      const timeGap = point.timestamp - lastPoint.timestamp > 100;
      
      return significantDistance || bodyPartChange || timeGap;
    };

    if (shouldIncludePoint(newPoint)) {
      currentStrokePoints.current.push(newPoint);
      lastPointRef.current = newPoint;
    }
  }, []);

  const finalizeStroke = useCallback((color: string, size: number): OptimizedDrawingStroke | null => {
    if (currentStrokePoints.current.length === 0) return null;

    const keyPoints = [...currentStrokePoints.current];
    
    // Calculate total stroke length for reconstruction
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
      playerId: '' // Will be set by the multiplayer handler
    };

    // Reset for next stroke
    currentStrokePoints.current = [];
    lastPointRef.current = null;

    return stroke;
  }, []);

  const reconstructStroke = useCallback((stroke: OptimizedDrawingStroke): THREE.Vector3[] => {
    if (stroke.keyPoints.length < 2) {
      return stroke.keyPoints.map(point => new THREE.Vector3(
        point.worldPosition.x,
        point.worldPosition.y,
        point.worldPosition.z
      ));
    }

    const reconstructedPoints: THREE.Vector3[] = [];
    
    // Use standardized Catmull-Rom interpolation for smooth reconstruction
    for (let i = 0; i < stroke.keyPoints.length - 1; i++) {
      const current = new THREE.Vector3(
        stroke.keyPoints[i].worldPosition.x,
        stroke.keyPoints[i].worldPosition.y,
        stroke.keyPoints[i].worldPosition.z
      );
      const next = new THREE.Vector3(
        stroke.keyPoints[i + 1].worldPosition.x,
        stroke.keyPoints[i + 1].worldPosition.y,
        stroke.keyPoints[i + 1].worldPosition.z
      );

      reconstructedPoints.push(current);

      // Only interpolate if both points are on the same body part
      if (stroke.keyPoints[i].bodyPart === stroke.keyPoints[i + 1].bodyPart) {
        const distance = current.distanceTo(next);
        const steps = Math.max(1, Math.floor(distance * 80 / stroke.metadata.size)); // Consistent with original interpolation
        
        for (let j = 1; j < steps; j++) {
          const t = j / steps;
          const interpolated = new THREE.Vector3().lerpVectors(current, next, t);
          reconstructedPoints.push(interpolated);
        }
      }
    }
    
    // Add the final point
    const lastPoint = stroke.keyPoints[stroke.keyPoints.length - 1];
    reconstructedPoints.push(new THREE.Vector3(
      lastPoint.worldPosition.x,
      lastPoint.worldPosition.y,
      lastPoint.worldPosition.z
    ));

    return reconstructedPoints;
  }, []);

  const resetStroke = useCallback(() => {
    currentStrokePoints.current = [];
    lastPointRef.current = null;
  }, []);

  return {
    addStrokePoint,
    finalizeStroke,
    reconstructStroke,
    resetStroke
  };
};
