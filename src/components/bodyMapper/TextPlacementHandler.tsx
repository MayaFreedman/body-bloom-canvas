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
    
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (drawingTarget === 'body' && child.userData.bodyPart) {
            meshes.push(child);
          } else if (drawingTarget === 'whiteboard' && child.userData.isWhiteboard) {
            meshes.push(child);
          }
        }
      });
    }
    
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
      console.log('📝 Text placement on', drawingTarget, 'at point:', intersect.point);
      onTextPlace(intersect.point, drawingTarget);
    } else {
      console.log('📝 No intersection found for text placement in', drawingTarget, 'mode');
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