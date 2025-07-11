
import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface UseDrawingEventHandlersProps {
  isDrawing: boolean;
  drawingTarget: 'body' | 'whiteboard';
  mode: string;
  brushSize: number;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  getIntersectedObjects: (includeWhiteboard?: boolean) => THREE.Mesh[];
  addMarkAtPosition: (worldPosition: THREE.Vector3, intersect: THREE.Intersection | undefined, surface: 'body' | 'whiteboard') => void;
  interpolateMarks: (start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection, surface?: 'body' | 'whiteboard') => void;
}

export const useDrawingEventHandlers = ({
  isDrawing,
  drawingTarget,
  mode,
  brushSize,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
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
    if (!isDrawing || mode === 'sensation') return;
    isMouseDown.current = true;
    strokeStarted.current = false;
    
    const rect = gl.domElement.getBoundingClientRect();
    const centerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const centerY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Test multiple positions around the cursor based on brush size
    const brushRadius = brushSize * 2; // Convert brush size to screen pixels
    const offsetPixels = brushRadius / 2; // Half the brush size
    const positions = [
      { x: centerX, y: centerY }, // Center
      { x: centerX + (offsetPixels / rect.width) * 2, y: centerY }, // Right
      { x: centerX - (offsetPixels / rect.width) * 2, y: centerY }, // Left
      { x: centerX, y: centerY + (offsetPixels / rect.height) * 2 }, // Up
      { x: centerX, y: centerY - (offsetPixels / rect.height) * 2 }, // Down
    ];

    let bestIntersect: THREE.Intersection | null = null;
    
    // Include whiteboard in intersection detection based on drawing target
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    
    // Test each position until we find a valid intersection
    for (const pos of positions) {
      mouse.x = pos.x;
      mouse.y = pos.y;
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        bestIntersect = intersects[0];
        break; // Early exit on first valid intersection
      }
    }

    if (bestIntersect) {
      const intersect = bestIntersect;
      
      // Handle body part intersection
      if (intersect.object.userData.bodyPart && drawingTarget === 'body') {
        if (onStrokeStart && !strokeStarted.current) {
          onStrokeStart();
          strokeStarted.current = true;
        }
        
        addMarkAtPosition(intersect.point, intersect, 'body');
        
        if (onAddToStroke && intersect.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: intersect.point.x,
              y: intersect.point.y,
              z: intersect.point.z
            },
            bodyPart: intersect.object.userData.bodyPart,
            surface: 'body',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        lastPosition.current = intersect.point.clone();
        lastBodyPart.current = intersect.object.userData.bodyPart;
        lastMarkTime.current = Date.now();
      }
      // Handle whiteboard intersection
      else if (intersect.object.userData.isWhiteboard && drawingTarget === 'whiteboard') {
        console.log('✅ Hit whiteboard at world coords:', {
          x: intersect.point.x.toFixed(3),
          y: intersect.point.y.toFixed(3),
          z: intersect.point.z.toFixed(3)
        }, 'object userData:', intersect.object.userData);
        if (onStrokeStart && !strokeStarted.current) {
          onStrokeStart();
          strokeStarted.current = true;
        }
        
        addMarkAtPosition(intersect.point, intersect, 'whiteboard');
        
        if (onAddToStroke && intersect.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: intersect.point.x,
              y: intersect.point.y,
              z: intersect.point.z
            },
            whiteboardRegion: `${intersect.point.x > 0 ? 'right' : 'left'}-${intersect.point.y > 0 ? 'top' : 'bottom'}`,
            surface: 'whiteboard',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        lastPosition.current = intersect.point.clone();
        lastBodyPart.current = 'whiteboard'; // Use whiteboard as identifier
        lastMarkTime.current = Date.now();
      }
    } else {
      console.log('❌ No valid intersection found for', drawingTarget, 'with brush edge detection');
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, onAddToStroke, camera, gl, raycaster, mouse, getIntersectedObjects, drawingTarget]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current || mode === 'sensation') return;
    
    const now = Date.now();
    
    // Enhanced throttling for smoother drawing - optimized for responsiveness
    const THROTTLE_TIME = 6; // Reduced from 8ms to 6ms for even smoother feel
    if (now - lastMarkTime.current < THROTTLE_TIME) return;

    const rect = gl.domElement.getBoundingClientRect();
    const centerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const centerY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Test multiple positions around the cursor based on brush size
    const brushRadius = brushSize * 2; // Convert brush size to screen pixels
    const offsetPixels = brushRadius / 2; // Half the brush size
    const positions = [
      { x: centerX, y: centerY }, // Center
      { x: centerX + (offsetPixels / rect.width) * 2, y: centerY }, // Right
      { x: centerX - (offsetPixels / rect.width) * 2, y: centerY }, // Left
      { x: centerX, y: centerY + (offsetPixels / rect.height) * 2 }, // Up
      { x: centerX, y: centerY - (offsetPixels / rect.height) * 2 }, // Down
    ];

    let bestIntersect: THREE.Intersection | null = null;
    
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    
    // Test each position until we find a valid intersection
    for (const pos of positions) {
      mouse.x = pos.x;
      mouse.y = pos.y;
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        bestIntersect = intersects[0];
        break; // Early exit on first valid intersection
      }
    }

    if (bestIntersect) {
      const intersect = bestIntersect;
      
      // Handle body drawing
      if (intersect.object.userData.bodyPart && drawingTarget === 'body') {
        const currentPosition = intersect.point;
        const currentBodyPart = intersect.object.userData.bodyPart;
        
        addMarkAtPosition(currentPosition, intersect, 'body');
        
        if (onAddToStroke && intersect.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: currentPosition.x,
              y: currentPosition.y,
              z: currentPosition.z
            },
            bodyPart: currentBodyPart,
            surface: 'body',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        if (lastPosition.current && lastBodyPart.current) {
          interpolateMarks(lastPosition.current, currentPosition, lastBodyPart.current, currentBodyPart, intersect, 'body');
        }
        
        lastPosition.current = currentPosition.clone();
        lastBodyPart.current = currentBodyPart;
        lastMarkTime.current = now;
      }
      // Handle whiteboard drawing
      else if (intersect.object.userData.isWhiteboard && drawingTarget === 'whiteboard') {
        const currentPosition = intersect.point;
        console.log('🖼️ Whiteboard move - world coords:', {
          x: currentPosition.x.toFixed(3),
          y: currentPosition.y.toFixed(3),
          z: currentPosition.z.toFixed(3)
        });
        
        addMarkAtPosition(currentPosition, intersect, 'whiteboard');
        
        if (onAddToStroke && intersect.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: currentPosition.x,
              y: currentPosition.y,
              z: currentPosition.z
            },
            whiteboardRegion: `${currentPosition.x > 0 ? 'right' : 'left'}-${currentPosition.y > 0 ? 'top' : 'bottom'}`,
            surface: 'whiteboard',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        if (lastPosition.current && lastBodyPart.current) {
          interpolateMarks(lastPosition.current, currentPosition, lastBodyPart.current, 'whiteboard', intersect, 'whiteboard');
        }
        
        lastPosition.current = currentPosition.clone();
        lastBodyPart.current = 'whiteboard';
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, addMarkAtPosition, onAddToStroke, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects, brushSize]);

  const handlePointerUp = useCallback(() => {
    console.log('🖱️ Pointer up - ending drawing, mode:', mode, 'strokeStarted:', strokeStarted.current, 'mouseDown:', isMouseDown.current);
    // Only complete strokes when actually in drawing mode
    if (isMouseDown.current && strokeStarted.current && mode === 'draw') {
      console.log('🏁 STROKE COMPLETE: Completing stroke in draw mode');
      if (onStrokeComplete) {
        onStrokeComplete();
      }
    } else {
      console.log('🚫 STROKE SKIP: Not completing stroke - mode:', mode, 'strokeStarted:', strokeStarted.current, 'mouseDown:', isMouseDown.current);
    }
    
    isMouseDown.current = false;
    lastPosition.current = null;
    lastBodyPart.current = null;
    strokeStarted.current = false;
  }, [onStrokeComplete, mode]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};
