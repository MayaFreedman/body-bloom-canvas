
import { useCallback } from 'react';
import * as THREE from 'three';

interface UseIntersectionUtilsProps {
  modelRef?: React.RefObject<THREE.Group>;
}

export const useIntersectionUtils = ({ modelRef }: UseIntersectionUtilsProps) => {
  const getIntersectedObjects = useCallback((includeWhiteboard: boolean = false) => {
    const meshes: THREE.Mesh[] = [];
    const modelGroup = modelRef?.current;
    
    console.log('🔍 getIntersectedObjects called, includeWhiteboard:', includeWhiteboard, 'modelGroup:', !!modelGroup);
    
    // Get body meshes from inside the model group
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.bodyPart) {
          console.log('🔍 Found body mesh in model group:', child.userData.bodyPart);
          meshes.push(child);
        }
      });
    }
    
    // Get whiteboard meshes ONLY from scene (outside model group) to prevent coordinate transformation issues
    if (includeWhiteboard && modelGroup?.parent) {
      console.log('🔍 Checking scene for whiteboard meshes...');
      modelGroup.parent.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.isWhiteboard) {
          console.log('🔍 Found whiteboard in scene:', child.userData);
          meshes.push(child);
        }
      });
    }
    
    console.log('🔍 Total meshes found:', meshes.length);
    return meshes;
  }, [modelRef]);

  const getWhiteboardRegion = useCallback((position: THREE.Vector3): string => {
    // Simple quadrant system for whiteboard regions
    const x = position.x;
    const y = position.y;
    
    if (x >= 0 && y >= 0) return 'top-right';
    if (x < 0 && y >= 0) return 'top-left';
    if (x >= 0 && y < 0) return 'bottom-right';
    return 'bottom-left';
  }, []);

  const getBodyPartAtPosition = useCallback((worldPosition: THREE.Vector3): string | null => {
    const modelGroup = modelRef?.current;
    if (!modelGroup) return null;

    let closestBodyPart: string | null = null;
    let closestDistance = Infinity;

    // Use raycasting to find the actual body part at this position
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1); // Cast ray towards the model
    raycaster.set(worldPosition, direction);

    const meshes: THREE.Mesh[] = [];
    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.bodyPart) {
        meshes.push(child);
      }
    });

    const intersects = raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0 && intersects[0].object.userData.bodyPart) {
      console.log('🎯 Raycasting found body part:', intersects[0].object.userData.bodyPart, 'at position');
      return intersects[0].object.userData.bodyPart;
    }

    // Fallback to distance-based approach with much larger tolerance
    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.bodyPart) {
        // Get the bounding box of the mesh
        const box = new THREE.Box3().setFromObject(child);
        const center = box.getCenter(new THREE.Vector3());
        
        // Calculate distance to the center of the mesh
        const distance = worldPosition.distanceTo(center);
        
        // Use bounding box size to determine reasonable distance threshold
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const threshold = maxDimension * 0.8; // 80% of the largest dimension
        
        if (distance < threshold && distance < closestDistance) {
          closestDistance = distance;
          closestBodyPart = child.userData.bodyPart;
        }
      }
    });

    if (closestBodyPart) {
      console.log('🎯 Distance-based found body part:', closestBodyPart, 'distance:', closestDistance.toFixed(3));
    } else {
      console.log('❌ No body part found at position:', {
        x: worldPosition.x.toFixed(3),
        y: worldPosition.y.toFixed(3), 
        z: worldPosition.z.toFixed(3)
      });
    }

    return closestBodyPart;
  }, [modelRef]);

  return {
    getIntersectedObjects,
    getBodyPartAtPosition,
    getWhiteboardRegion
  };
};
