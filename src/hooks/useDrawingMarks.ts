
import { useCallback } from 'react';
import * as THREE from 'three';

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
  modelRef?: React.RefObject<THREE.Group>;
  getBodyPartAtPosition: (worldPosition: THREE.Vector3) => string | null;
}

export const useDrawingMarks = ({
  selectedColor,
  brushSize,
  onAddMark,
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
    }
  }, [selectedColor, brushSize, onAddMark, modelRef]);

  const interpolateMarks = useCallback((start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection) => {
    // Only interpolate if both points are on the same body part
    if (startBodyPart !== endBodyPart) {
      return;
    }

    const distance = start.distanceTo(end);
    
    // Significantly increased interpolation - much more for smaller brushes
    const getStepCount = (size: number, distance: number): number => {
      // Base steps dramatically increased, with smaller brushes getting exponentially more
      let baseMultiplier;
      if (size <= 3) {
        baseMultiplier = 150; // Tiny brushes get massive interpolation
      } else if (size <= 5) {
        baseMultiplier = 120; // Small brushes get very high interpolation
      } else if (size <= 8) {
        baseMultiplier = 90;  // Medium brushes get high interpolation
      } else if (size <= 12) {
        baseMultiplier = 70;  // Larger brushes get good interpolation
      } else {
        baseMultiplier = 50;  // Largest brushes get moderate interpolation
      }
      
      const calculatedSteps = Math.floor(distance * baseMultiplier);
      
      // Much higher maximums, especially for small brushes
      let maxSteps;
      if (size <= 3) {
        maxSteps = 80;  // Tiny brushes can have up to 80 steps
      } else if (size <= 5) {
        maxSteps = 60;  // Small brushes can have up to 60 steps
      } else if (size <= 8) {
        maxSteps = 45;  // Medium brushes can have up to 45 steps
      } else if (size <= 12) {
        maxSteps = 35;  // Larger brushes can have up to 35 steps
      } else {
        maxSteps = 25;  // Largest brushes can have up to 25 steps
      }
      
      return Math.max(1, Math.min(maxSteps, calculatedSteps));
    };
    
    const steps = getStepCount(brushSize, distance);
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Use smoothstep function for enhanced smoothing
      const smoothT = t * t * (3 - 2 * t);
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, smoothT);
      
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
