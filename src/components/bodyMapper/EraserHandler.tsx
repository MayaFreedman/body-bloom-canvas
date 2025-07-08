
import React, { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface EraserHandlerProps {
  isErasing: boolean;
  eraserRadius: number;
  drawingTarget: 'body' | 'whiteboard';
  onErase: (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard') => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const EraserHandler = ({ 
  isErasing, 
  eraserRadius, 
  drawingTarget,
  onErase,
  modelRef 
}: EraserHandlerProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);

  const getIntersectedObjects = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    const modelGroup = modelRef?.current;
    
    if (modelGroup) {
      // Get body meshes from inside the model group
      if (drawingTarget === 'body') {
        modelGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.bodyPart) {
            meshes.push(child);
          }
        });
      }
      
      // Get whiteboard meshes ONLY from scene (outside model group)
      if (drawingTarget === 'whiteboard' && modelGroup.parent) {
        modelGroup.parent.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isWhiteboard) {
            meshes.push(child);
          }
        });
      }
    }
    
    return meshes;
  }, [modelRef, drawingTarget]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isErasing) return;
    isMouseDown.current = true;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log('🧽 Erasing on', drawingTarget, 'at point:', intersect.point, 'intersected object:', intersect.object.userData);
      onErase(intersect.point, eraserRadius, drawingTarget);
    } else {
      console.log('🧽 No intersection found for', drawingTarget, 'mode. Available meshes:', meshes.length);
    }
  }, [isErasing, eraserRadius, onErase, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isErasing || !isMouseDown.current) return;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      onErase(intersect.point, eraserRadius, drawingTarget);
    }
  }, [isErasing, eraserRadius, onErase, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    isMouseDown.current = false;
  }, []);

  React.useEffect(() => {
    if (isErasing) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointerleave', handlePointerUp);
      
      gl.domElement.style.cursor = 'crosshair';
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
        gl.domElement.removeEventListener('pointerleave', handlePointerUp);
        gl.domElement.style.cursor = 'default';
      };
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isErasing, handlePointerDown, handlePointerMove, handlePointerUp, gl]);

  return null;
};
