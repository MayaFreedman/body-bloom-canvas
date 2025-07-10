import React, { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface UseTextEventHandlersProps {
  isTextMode: boolean;
  drawingTarget: 'body' | 'whiteboard';
  getIntersectedObjects: (includeWhiteboard?: boolean) => THREE.Mesh[];
  placeTextAtPosition: (worldPosition: THREE.Vector3, intersect: THREE.Intersection | undefined, surface: 'body' | 'whiteboard') => void;
}

export const useTextEventHandlers = ({
  isTextMode,
  drawingTarget,
  getIntersectedObjects,
  placeTextAtPosition
}: UseTextEventHandlersProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const mouseClickTime = useRef(0);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isTextMode) return;

    mouseClickTime.current = Date.now();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Get intersected objects based on drawing target
    const includeWhiteboard = drawingTarget === 'whiteboard';
    const meshes = getIntersectedObjects(includeWhiteboard);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const worldPosition = intersect.point;

      console.log('📝 Text click at world position:', worldPosition, 'on', drawingTarget);
      
      // Place text using the same logic as drawing marks
      placeTextAtPosition(worldPosition, intersect, drawingTarget);
    } else {
      console.log('📝 No intersection found for text placement in', drawingTarget, 'mode');
    }
  }, [isTextMode, drawingTarget, camera, gl, raycaster, mouse, getIntersectedObjects, placeTextAtPosition]);

  // Set cursor style
  React.useEffect(() => {
    if (isTextMode) {
      gl.domElement.style.cursor = 'text';
      return () => {
        gl.domElement.style.cursor = 'default';
      };
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isTextMode, gl]);

  return {
    handlePointerDown
  };
};