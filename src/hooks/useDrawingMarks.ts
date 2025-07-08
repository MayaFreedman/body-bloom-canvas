
import { useCallback } from 'react';
import * as THREE from 'three';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  surface?: 'body' | 'whiteboard';
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

  const addMarkAtPosition = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection, surface: 'body' | 'whiteboard' = 'body') => {
    const modelGroup = modelRef?.current;
    const localPosition = new THREE.Vector3();
    
    if (surface === 'whiteboard') {
      // For whiteboard, store coordinates in absolute world space
      // This ensures they don't rotate with the body
      localPosition.copy(worldPosition);
      console.log('🎨 Adding whiteboard mark at absolute world position:', localPosition);
    } else if (modelGroup) {
      // For body, transform to model local space so they rotate with the body
      modelGroup.worldToLocal(localPosition.copy(worldPosition));
      console.log('🎨 Adding body mark at local position:', localPosition);
    } else {
      console.error('❌ No model group available for body mark');
      return;
    }
    
    const mark: DrawingMark = {
      id: `mark-${Date.now()}-${Math.random()}`,
      position: localPosition,
      color: selectedColor,
      size: brushSize / 200,
      surface: surface
    };
    onAddMark(mark);
    
    console.log('Added mark:', surface, 'at position:', localPosition, 'brush size:', brushSize, 'mark size:', mark.size);
  }, [selectedColor, brushSize, onAddMark, modelRef]);

  const interpolateMarks = useCallback((start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection, surface: 'body' | 'whiteboard' = 'body') => {
    console.log('🎨 Interpolating between points, distance:', start.distanceTo(end), 'brush size:', brushSize, 'surface:', surface);
    
    // For whiteboard, always allow interpolation; for body, check same body part
    if (surface === 'body' && startBodyPart !== endBodyPart) {
      console.log('❌ Different body parts, skipping interpolation');
      return;
    }

    const distance = start.distanceTo(end);
    
    const getStepCount = (size: number, distance: number): number => {
      let baseMultiplier;
      if (size <= 3) {
        baseMultiplier = 150;
      } else if (size <= 5) {
        baseMultiplier = 120;
      } else if (size <= 8) {
        baseMultiplier = 90;
      } else if (size <= 12) {
        baseMultiplier = 70;
      } else {
        baseMultiplier = 50;
      }
      
      const calculatedSteps = Math.floor(distance * baseMultiplier);
      
      let maxSteps;
      if (size <= 3) {
        maxSteps = 80;
      } else if (size <= 5) {
        maxSteps = 60;
      } else if (size <= 8) {
        maxSteps = 45;
      } else if (size <= 12) {
        maxSteps = 35;
      } else {
        maxSteps = 25;
      }
      
      return Math.max(1, Math.min(maxSteps, calculatedSteps));
    };
    
    const steps = getStepCount(brushSize, distance);
    console.log('🎨 Will create', steps, 'interpolated steps for distance', distance.toFixed(3));
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const smoothT = t * t * (3 - 2 * t);
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, smoothT);
      
      // For whiteboard, skip body part validation
      if (surface === 'whiteboard') {
        addMarkAtPosition(interpolatedPosition, endIntersect, surface);
      } else {
        // For body, validate that the interpolated position is still on the same body part
        const bodyPartAtInterpolated = getBodyPartAtPosition(interpolatedPosition);
        if (bodyPartAtInterpolated === startBodyPart) {
          addMarkAtPosition(interpolatedPosition, endIntersect, surface);
        } else {
          console.log('⚠️ Interpolated point not on same body part, skipping');
        }
      }
    }
  }, [addMarkAtPosition, getBodyPartAtPosition, brushSize]);

  return {
    addMarkAtPosition,
    interpolateMarks
  };
};
