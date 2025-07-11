
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

  const getBodyPartAtPosition = useCallback((worldPosition: THREE.Vector3, brushRadius: number = 0): string | null => {
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
      console.log('🎯 Direct hit - body part:', intersects[0].object.userData.bodyPart);
      return intersects[0].object.userData.bodyPart;
    }

    // If no direct hit but we have a brush radius, check for near misses
    if (brushRadius > 0) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.bodyPart) {
          // Get closest point on mesh to our position
          const box = new THREE.Box3().setFromObject(child);
          const closestPoint = box.clampPoint(worldPosition, new THREE.Vector3());
          const distance = worldPosition.distanceTo(closestPoint);
          
          // Check if we're within brush radius of this mesh
          if (distance <= brushRadius && distance < closestDistance) {
            closestDistance = distance;
            closestBodyPart = child.userData.bodyPart;
          }
        }
      });
      
      if (closestBodyPart) {
        console.log('🎯 Brush radius hit - body part:', closestBodyPart, 'distance:', closestDistance.toFixed(3));
        return closestBodyPart;
      }
    }

    console.log('❌ No body part found at position within radius:', brushRadius);
    return closestBodyPart;
  }, [modelRef]);

  const canDrawAtPosition = useCallback((worldPosition: THREE.Vector3, brushSize: number, target: 'body' | 'whiteboard'): boolean => {
    if (target === 'whiteboard') {
      // For whiteboard, we can always draw
      return true;
    }
    
    // For body, check if brush area intersects with any body part
    const brushRadius = (brushSize / 200) * 0.1; // Convert brush size to world units
    const bodyPart = getBodyPartAtPosition(worldPosition, brushRadius);
    return bodyPart !== null;
  }, [getBodyPartAtPosition]);

  return {
    getIntersectedObjects,
    getBodyPartAtPosition,
    getWhiteboardRegion,
    canDrawAtPosition
  };
};
