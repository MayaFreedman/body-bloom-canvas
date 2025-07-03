

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
  const frameCount = useRef(0);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    strokeStarted.current = false;
    frameCount.current = 0;
    
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
        
        addMarkAtPosition(intersect.point, intersect);
        lastPosition.current = intersect.point.clone();
        lastBodyPart.current = intersect.object.userData.bodyPart;
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    frameCount.current++;
    const now = Date.now();
    
    // Adaptive throttling based on performance
    // Reduce throttle for smaller brushes to capture more detail
    const getThrottleTime = (): number => {
      // For the first few frames, be more responsive
      if (frameCount.current < 5) return 8;
      
      // Performance-based throttling
      // If we're getting too many events, throttle more aggressively
      const timeSinceStart = now - (lastMarkTime.current - 100);
      const eventsPerSecond = frameCount.current / (timeSinceStart / 1000);
      
      if (eventsPerSecond > 120) return 20; // Slow down if too fast
      if (eventsPerSecond > 80) return 16;  // Standard throttle
      return 12; // Faster for smooth drawing
    };
    
    const throttleTime = getThrottleTime();
    if (now - lastMarkTime.current < throttleTime) return;

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
        
        if (lastPosition.current && lastBodyPart.current) {
          interpolateMarks(lastPosition.current, currentPosition, lastBodyPart.current, currentBodyPart, intersect);
        } else {
          addMarkAtPosition(currentPosition, intersect);
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
    frameCount.current = 0;
  }, [onStrokeComplete]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};

