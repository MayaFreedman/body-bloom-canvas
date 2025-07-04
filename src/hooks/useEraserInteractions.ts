
import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface UseEraserInteractionsProps {
  isErasing: boolean;
  eraserRadius: number;
  onErase: (center: THREE.Vector3, radius: number) => void;
  getIntersectedObjects: () => THREE.Mesh[];
}

export const useEraserInteractions = ({
  isErasing,
  eraserRadius,
  onErase,
  getIntersectedObjects
}: UseEraserInteractionsProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);

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
      onErase(intersect.point, eraserRadius);
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
      onErase(intersect.point, eraserRadius);
    }
  }, [isErasing, eraserRadius, onErase, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    isMouseDown.current = false;
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};
