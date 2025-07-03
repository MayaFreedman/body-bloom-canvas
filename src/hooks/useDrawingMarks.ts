
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
    
    // Smart interpolation: more for smaller brushes, but capped to prevent excessive marks
    const baseMultiplier = Math.max(25, 125 - (brushSize * 5)); // Range: 25-100
    const maxSteps = brushSize <= 5 ? 50 : brushSize <= 10 ? 30 : 15; // Adaptive cap
    const calculatedSteps = Math.floor(distance * baseMultiplier);
    const steps = Math.max(1, Math.min(maxSteps, calculatedSteps));
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
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
