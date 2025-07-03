

import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface UseDrawingEventHandlersProps {
  isDrawing: boolean;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  getIntersectedObjects: () => THREE.Mesh[];
  addMarkAtPosition: (worldPosition: THREE.Vector3, intersect?: THREE.Intersection) => void;
  interpolateMarks: (start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection) => void;
}

export const useDrawingEventHandlers = ({
  isDrawing,
  onStrokeStart,
  onStrokeComplete,
  getIntersectedObjects,
  addMarkAtPosition,
  interpolateMarks
}: UseDrawingEventHandlersProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);
  const lastMarkTime = useRef(0);
  const lastPosition = useRef<THREE.Vector3 | null>(null);
  const lastBodyPart = useRef<string | null>(null);
  const strokeStarted = useRef(false);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    strokeStarted.current = false;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      if (intersect.object.userData.bodyPart) {
        if (onStrokeStart && !strokeStarted.current) {
          onStrokeStart();
          strokeStarted.current = true;
        }
        
        // Place mark immediately - no throttling for primary marks
        addMarkAtPosition(intersect.point, intersect);
        lastPosition.current = intersect.point.clone();
        lastBodyPart.current = intersect.object.userData.bodyPart;
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    const now = Date.now();
    
    // Fixed, predictable throttling - optimized for responsiveness
    const THROTTLE_TIME = 8; // Consistent 8ms for smooth feel
    if (now - lastMarkTime.current < THROTTLE_TIME) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      if (intersect.object.userData.bodyPart) {
        const currentPosition = intersect.point;
        const currentBodyPart = intersect.object.userData.bodyPart;
        
        // Place primary mark immediately
        addMarkAtPosition(currentPosition, intersect);
        
        // Do interpolation if we have a previous position
        if (lastPosition.current && lastBodyPart.current) {
          interpolateMarks(lastPosition.current, currentPosition, lastBodyPart.current, currentBodyPart, intersect);
        }
        
        lastPosition.current = currentPosition.clone();
        lastBodyPart.current = currentBodyPart;
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, addMarkAtPosition, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    if (isMouseDown.current && strokeStarted.current) {
      if (onStrokeComplete) {
        onStrokeComplete();
      }
    }
    
    isMouseDown.current = false;
    lastPosition.current = null;
    lastBodyPart.current = null;
    strokeStarted.current = false;
  }, [onStrokeComplete]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};

