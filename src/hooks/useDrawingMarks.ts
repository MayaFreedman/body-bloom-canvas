

import { useCallback } from 'react';
import * as THREE from 'three';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface UseDrawingMarksProps {
  selectedColor: string;
  brushSize: number;
  onAddMark: (mark: DrawingMark) => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  modelRef?: React.RefObject<THREE.Group>;
  getBodyPartAtPosition: (worldPosition: THREE.Vector3) => string | null;
}

export const useDrawingMarks = ({
  selectedColor,
  brushSize,
  onAddMark,
  onAddToStroke,
  modelRef,
  getBodyPartAtPosition
}: UseDrawingMarksProps) => {

  const addMarkAtPosition = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection, isInterpolated: boolean = false) => {
    const modelGroup = modelRef?.current;
    if (modelGroup) {
      const localPosition = new THREE.Vector3();
      modelGroup.worldToLocal(localPosition.copy(worldPosition));
      
      // Make actual drawing marks much smaller - divide by 200 instead of 100
      const mark: DrawingMark = {
        id: `mark-${Date.now()}-${Math.random()}`,
        position: localPosition,
        color: selectedColor,
        size: brushSize / 200
      };
      onAddMark(mark);
      
      // Only send network updates for actual user clicks, not interpolated points
      // This dramatically reduces network traffic
      if (onAddToStroke && intersect && intersect.object instanceof THREE.Mesh && !isInterpolated) {
        const worldPoint: WorldDrawingPoint = {
          id: mark.id,
          worldPosition: {
            x: worldPosition.x,
            y: worldPosition.y,
            z: worldPosition.z
          },
          bodyPart: intersect.object.userData.bodyPart,
          color: selectedColor,
          size: brushSize / 200
        };
        onAddToStroke(worldPoint);
      }
    }
  }, [selectedColor, brushSize, onAddMark, onAddToStroke, modelRef]);

  const interpolateMarks = useCallback((start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection) => {
    // Only interpolate if both points are on the same body part
    if (startBodyPart !== endBodyPart) {
      return;
    }

    const distance = start.distanceTo(end);
    
    // Enhanced adaptive interpolation for smoother lines
    // Much higher base multipliers for ultra-smooth results
    const getBaseMultiplier = (size: number): number => {
      if (size <= 3) return 200;  // Highest quality for smallest brushes
      if (size <= 5) return 175;  // Very high quality for small brushes  
      if (size <= 8) return 150;  // High quality for medium brushes
      if (size <= 12) return 125; // Good quality for larger brushes
      return 100; // Standard quality for largest brushes
    };
    
    // Adaptive max steps based on brush size - much higher limits
    const getMaxSteps = (size: number): number => {
      if (size <= 3) return 80;   // Ultra-smooth for tiny brushes
      if (size <= 5) return 65;   // Very smooth for small brushes
      if (size <= 8) return 55;   // Smooth for medium brushes
      if (size <= 12) return 40;  // Good for larger brushes
      return 25; // Reasonable for largest brushes
    };
    
    const baseMultiplier = getBaseMultiplier(brushSize);
    const maxSteps = getMaxSteps(brushSize);
    const calculatedSteps = Math.floor(distance * baseMultiplier);
    const steps = Math.max(1, Math.min(maxSteps, calculatedSteps));
    
    // Performance monitoring - warn if we're creating too many marks
    if (steps > 60) {
      console.log(`🔍 High interpolation: ${steps} steps for distance ${distance.toFixed(3)} with brush size ${brushSize}`);
    }
    
    // Cap extreme cases to prevent performance issues
    const finalSteps = Math.min(steps, 100); // Absolute safety cap
    
    for (let i = 1; i <= finalSteps; i++) {
      const t = i / finalSteps;
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, t);
      
      // Validate that the interpolated position is still on the same body part
      const bodyPartAtInterpolated = getBodyPartAtPosition(interpolatedPosition);
      if (bodyPartAtInterpolated === startBodyPart) {
        // Mark as interpolated to skip network updates
        addMarkAtPosition(interpolatedPosition, endIntersect, true);
      }
    }
  }, [addMarkAtPosition, getBodyPartAtPosition, brushSize]);

  return {
    addMarkAtPosition,
    interpolateMarks
  };
};

