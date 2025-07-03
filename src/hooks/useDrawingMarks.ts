
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

  const addMarkAtPosition = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection) => {
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
      
      if (onAddToStroke && intersect && intersect.object instanceof THREE.Mesh) {
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
    const steps = Math.max(1, Math.floor(distance * 50));
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, t);
      
      // Validate that the interpolated position is still on the same body part
      const bodyPartAtInterpolated = getBodyPartAtPosition(interpolatedPosition);
      if (bodyPartAtInterpolated === startBodyPart) {
        addMarkAtPosition(interpolatedPosition, endIntersect);
      }
    }
  }, [addMarkAtPosition, getBodyPartAtPosition]);

  return {
    addMarkAtPosition,
    interpolateMarks
  };
};
