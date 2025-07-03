
import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface UseIntersectionUtilsProps {
  modelRef?: React.RefObject<THREE.Group>;
}

export const useIntersectionUtils = ({ modelRef }: UseIntersectionUtilsProps) => {
  const { raycaster } = useThree();

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
    raycaster.set(worldPosition, new THREE.Vector3(0, 0, -1).normalize());
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
      return intersects[0].object.userData.bodyPart || null;
    }
    return null;
  }, [raycaster, getIntersectedObjects]);

  return {
    getIntersectedObjects,
    getBodyPartAtPosition
  };
};
