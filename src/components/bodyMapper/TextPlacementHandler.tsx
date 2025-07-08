import React, { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface TextPlacementHandlerProps {
  isTextMode: boolean;
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
  onTextPlace: (position: THREE.Vector3, surface: 'body' | 'whiteboard') => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const TextPlacementHandler = ({
  isTextMode,
  selectedColor,
  drawingTarget,
  onTextPlace,
  modelRef
}: TextPlacementHandlerProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const placementCooldown = useRef(false);

  const getIntersectedObjects = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    const modelGroup = modelRef?.current;
    
    console.log('📝 TextPlacement: Getting intersected objects for', drawingTarget, 'modelGroup:', !!modelGroup);
    
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log('📝 Found mesh with userData:', child.userData);
          if (drawingTarget === 'body' && child.userData.bodyPart) {
            console.log('📝 Adding body mesh:', child.userData.bodyPart);
            meshes.push(child);
          } else if (drawingTarget === 'whiteboard' && child.userData.isWhiteboard) {
            console.log('📝 Adding whiteboard mesh');
            meshes.push(child);
          }
        }
      });
    }
    
    // For whiteboard, also check scene directly since whiteboard is outside model group
    if (drawingTarget === 'whiteboard') {
      const scene = modelGroup?.parent;
      console.log('📝 Checking scene directly for whiteboard, scene:', !!scene);
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isWhiteboard) {
            console.log('📝 Found whiteboard in scene:', child.userData);
            meshes.push(child);
          }
        });
      }
    }
    
    console.log('📝 Total meshes found:', meshes.length);
    return meshes;
  }, [modelRef, drawingTarget]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isTextMode || placementCooldown.current) return;
    
    // Prevent rapid placements
    placementCooldown.current = true;
    setTimeout(() => {
      placementCooldown.current = false;
    }, 200);

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log('📝 Text placement on', drawingTarget, 'at point:', intersect.point, 'object:', intersect.object.userData);
      onTextPlace(intersect.point, drawingTarget);
    } else {
      console.log('📝 No intersection found for text placement in', drawingTarget, 'mode. Available meshes:', meshes.length);
      meshes.forEach((mesh, i) => {
        console.log(`  Available mesh ${i}:`, mesh.userData);
      });
    }
  }, [isTextMode, onTextPlace, camera, gl, raycaster, mouse, getIntersectedObjects, drawingTarget]);

  React.useEffect(() => {
    if (isTextMode) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.style.cursor = 'text';
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.style.cursor = 'default';
      };
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isTextMode, handlePointerDown, gl]);

  return null;
};