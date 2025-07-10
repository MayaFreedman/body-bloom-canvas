import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { TextMark } from '@/types/textTypes';

interface UseTextPlacementProps {
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
  textToPlace: string;
  onAddTextMark: (position: THREE.Vector3, text: string, surface: 'body' | 'whiteboard', color: string) => TextMark;
  modelRef?: React.RefObject<THREE.Group>;
  getBodyPartAtPosition: (worldPosition: THREE.Vector3) => string | null;
}

export const useTextPlacement = ({
  selectedColor,
  drawingTarget,
  textToPlace,
  onAddTextMark,
  modelRef,
  getBodyPartAtPosition
}: UseTextPlacementProps) => {
  const placementCooldown = useRef(false);

  const placeTextAtPosition = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection, surface: 'body' | 'whiteboard' = 'body') => {
    if (!textToPlace?.trim() || placementCooldown.current) return;

    // Prevent rapid placements
    placementCooldown.current = true;
    setTimeout(() => {
      placementCooldown.current = false;
    }, 200);

    console.log('📝 Text placement at world position:', worldPosition, 'surface:', surface);

    let finalPosition = worldPosition.clone();

    if (surface === 'body' && modelRef?.current) {
      // Transform to model space like drawing marks
      const modelGroup = modelRef.current;
      const worldToLocal = new THREE.Matrix4().copy(modelGroup.matrixWorld).invert();
      finalPosition = worldPosition.clone().applyMatrix4(worldToLocal);

      // Get body part for validation
      const bodyPart = getBodyPartAtPosition(worldPosition);
      console.log('📝 Text placement on body part:', bodyPart);

      // Calculate proper surface orientation using intersection normal
      let rotation = { x: 0, y: 0, z: 0 };
      if (intersect?.face?.normal) {
        const normal = intersect.face.normal.clone().normalize();
        // Transform normal to local space
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldToLocal);
        normal.applyMatrix3(normalMatrix).normalize();
        
        // Apply small offset along surface normal
        finalPosition.add(normal.multiplyScalar(0.01));
        
        // Calculate rotation to face outward from surface
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, normal).normalize();
        const adjustedUp = new THREE.Vector3().crossVectors(normal, right).normalize();
        
        // Create rotation matrix from surface orientation
        const rotationMatrix = new THREE.Matrix4().makeBasis(right, adjustedUp, normal);
        const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix);
        rotation = { x: euler.x, y: euler.y, z: euler.z };
      } else {
        // Fallback: small outward offset from center
        const center = new THREE.Vector3(0, 0, 0);
        const direction = finalPosition.clone().sub(center).normalize();
        finalPosition.add(direction.multiplyScalar(0.01));
      }

      // Create text mark with rotation
      const textMark = onAddTextMark(finalPosition, textToPlace.trim(), surface, selectedColor);
      if (textMark && intersect?.face?.normal) {
        // Update the text mark with proper rotation
        textMark.rotation = rotation;
      }
      return;
    }

    // Create text mark (for whiteboard surface)
    if (surface === 'whiteboard') {
      onAddTextMark(finalPosition, textToPlace.trim(), surface, selectedColor);
    }
  }, [onAddTextMark, selectedColor, textToPlace, modelRef, getBodyPartAtPosition]);

  return {
    placeTextAtPosition
  };
};