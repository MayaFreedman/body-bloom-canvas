import React, { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface EraserHandlerProps {
  isErasing: boolean;
  eraserRadius: number;
  onErase: (center: THREE.Vector3, radius: number) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const EraserHandler = ({ 
  isErasing, 
  eraserRadius, 
  onErase,
  modelRef 
}: EraserHandlerProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);

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

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isErasing) return;
    isMouseDown.current = true;
    
    console.log('🧹 ERASER: Pointer down, starting erase operation');
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log('🧹 ERASER: Found intersection at', intersect.point, 'with radius', eraserRadius);
      onErase(intersect.point, eraserRadius);
    } else {
      console.log('🧹 ERASER: No intersection found for erase operation');
    }
  }, [isErasing, eraserRadius, onErase, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isErasing || !isMouseDown.current) return;
    
    console.log('🧹 ERASER: Pointer move while erasing');
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log('🧹 ERASER: Move intersection at', intersect.point, 'with radius', eraserRadius);
      onErase(intersect.point, eraserRadius);
    }
  }, [isErasing, eraserRadius, onErase, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    if (isMouseDown.current) {
      console.log('🧹 ERASER: Pointer up, ending erase operation');
    }
    isMouseDown.current = false;
  }, []);

  React.useEffect(() => {
    if (isErasing) {
      console.log('🧹 ERASER: Erasing mode activated');
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointerleave', handlePointerUp);
      
      gl.domElement.style.cursor = 'crosshair';
      
      return () => {
        console.log('🧹 ERASER: Cleaning up eraser event listeners');
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
