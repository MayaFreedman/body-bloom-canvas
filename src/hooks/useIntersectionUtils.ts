
import { useCallback } from 'react';
import * as THREE from 'three';

interface UseIntersectionUtilsProps {
  modelRef?: React.RefObject<THREE.Group>;
}

export const useIntersectionUtils = ({ modelRef }: UseIntersectionUtilsProps) => {
  const getIntersectedObjects = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    const modelGroup = modelRef?.current;
    
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.bodyPart) {
          meshes.push(child);
        }
      });
    }
    
    return meshes;
  }, [modelRef]);

  const getBodyPartAtPosition = useCallback((worldPosition: THREE.Vector3): string | null => {
    const modelGroup = modelRef?.current;
    if (!modelGroup) return null;

    let closestBodyPart: string | null = null;
    let closestDistance = Infinity;

    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.bodyPart) {
        const distance = worldPosition.distanceTo(child.position);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestBodyPart = child.userData.bodyPart;
        }
      }
    });

    return closestBodyPart;
  }, [modelRef]);

  return {
    getIntersectedObjects,
    getBodyPartAtPosition
  };
};
