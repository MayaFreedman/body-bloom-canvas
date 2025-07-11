
import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface UseDrawingEventHandlersProps {
  isDrawing: boolean;
  drawingTarget: 'body' | 'whiteboard';
  mode: string;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  getIntersectedObjects: (includeWhiteboard?: boolean) => THREE.Mesh[];
  addMarkAtPosition: (worldPosition: THREE.Vector3, intersect: THREE.Intersection | undefined, surface: 'body' | 'whiteboard') => void;
  interpolateMarks: (start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection, surface?: 'body' | 'whiteboard') => void;
  canDrawAtPosition: (worldPosition: THREE.Vector3, brushSize: number, target: 'body' | 'whiteboard') => boolean;
  brushSize: number;
}

export const useDrawingEventHandlers = ({
  isDrawing,
  drawingTarget,
  mode,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  getIntersectedObjects,
  addMarkAtPosition,
  interpolateMarks,
  canDrawAtPosition,
  brushSize
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
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Calculate world position for brush radius checking
    const planeZ = drawingTarget === 'body' ? 0 : 5; // Approximate Z for intersection
    const worldPosition = new THREE.Vector3();
    raycaster.ray.at(planeZ, worldPosition);
    
    // Check if we can draw at this position considering brush radius
    if (canDrawAtPosition(worldPosition, brushSize, drawingTarget)) {
      console.log('✅ Can draw at position with brush radius');
      
      // Now get the actual intersection for precise positioning
      const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
      const intersects = raycaster.intersectObjects(meshes, false);
      
      let intersect: THREE.Intersection | undefined;
      if (intersects.length > 0) {
        intersect = intersects[0];
        worldPosition.copy(intersect.point); // Use precise intersection point
      }
      
      // Handle body drawing
      if (drawingTarget === 'body') {
        if (onStrokeStart && !strokeStarted.current) {
          onStrokeStart();
          strokeStarted.current = true;
        }
        
        addMarkAtPosition(worldPosition, intersect, 'body');
        
        if (onAddToStroke && intersect?.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: worldPosition.x,
              y: worldPosition.y,
              z: worldPosition.z
            },
            bodyPart: intersect.object.userData.bodyPart || 'unknown',
            surface: 'body',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        lastPosition.current = worldPosition.clone();
        lastBodyPart.current = intersect?.object.userData.bodyPart || 'body';
        lastMarkTime.current = Date.now();
      }
      // Handle whiteboard drawing
      else if (drawingTarget === 'whiteboard') {
        console.log('✅ Hit whiteboard at world coords:', {
          x: worldPosition.x.toFixed(3),
          y: worldPosition.y.toFixed(3),
          z: worldPosition.z.toFixed(3)
        });
        if (onStrokeStart && !strokeStarted.current) {
          onStrokeStart();
          strokeStarted.current = true;
        }
        
        addMarkAtPosition(worldPosition, intersect, 'whiteboard');
        
        if (onAddToStroke) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: worldPosition.x,
              y: worldPosition.y,
              z: worldPosition.z
            },
            whiteboardRegion: `${worldPosition.x > 0 ? 'right' : 'left'}-${worldPosition.y > 0 ? 'top' : 'bottom'}`,
            surface: 'whiteboard',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        lastPosition.current = worldPosition.clone();
        lastBodyPart.current = 'whiteboard';
        lastMarkTime.current = Date.now();
      }
    } else {
      console.log('❌ Cannot draw at position with brush radius');
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, onAddToStroke, camera, gl, raycaster, mouse, getIntersectedObjects, drawingTarget]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current || mode === 'sensation') return;
    
    const now = Date.now();
    
    // Enhanced throttling for smoother drawing - optimized for responsiveness
    const THROTTLE_TIME = 6; // Reduced from 8ms to 6ms for even smoother feel
    if (now - lastMarkTime.current < THROTTLE_TIME) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Calculate world position for brush radius checking
    const planeZ = drawingTarget === 'body' ? 0 : 5;
    const worldPosition = new THREE.Vector3();
    raycaster.ray.at(planeZ, worldPosition);
    
    // Check if we can draw at this position considering brush radius
    if (canDrawAtPosition(worldPosition, brushSize, drawingTarget)) {
      const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
      const intersects = raycaster.intersectObjects(meshes, false);
      
      let moveIntersect: THREE.Intersection | undefined;
      if (intersects.length > 0) {
        moveIntersect = intersects[0];
        worldPosition.copy(moveIntersect.point);
      }
      
      // Handle body drawing
      if (drawingTarget === 'body') {
        addMarkAtPosition(worldPosition, moveIntersect, 'body');
        
        if (onAddToStroke && moveIntersect?.object instanceof THREE.Mesh) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: worldPosition.x,
              y: worldPosition.y,
              z: worldPosition.z
            },
            bodyPart: moveIntersect.object.userData.bodyPart || 'unknown',
            surface: 'body',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        if (lastPosition.current && lastBodyPart.current) {
          const currentBodyPart = moveIntersect?.object.userData.bodyPart || 'body';
          interpolateMarks(lastPosition.current, worldPosition, lastBodyPart.current, currentBodyPart, moveIntersect, 'body');
        }
        
        lastPosition.current = worldPosition.clone();
        lastBodyPart.current = moveIntersect?.object.userData.bodyPart || 'body';
        lastMarkTime.current = now;
      }
      // Handle whiteboard drawing
      else if (drawingTarget === 'whiteboard') {
        console.log('🖼️ Whiteboard move - world coords:', {
          x: worldPosition.x.toFixed(3),
          y: worldPosition.y.toFixed(3),
          z: worldPosition.z.toFixed(3)
        });
        
        addMarkAtPosition(worldPosition, moveIntersect, 'whiteboard');
        
        if (onAddToStroke) {
          const worldPoint: WorldDrawingPoint = {
            id: `point-${Date.now()}-${Math.random()}`,
            worldPosition: {
              x: worldPosition.x,
              y: worldPosition.y,
              z: worldPosition.z
            },
            whiteboardRegion: `${worldPosition.x > 0 ? 'right' : 'left'}-${worldPosition.y > 0 ? 'top' : 'bottom'}`,
            surface: 'whiteboard',
            color: '',
            size: 0
          };
          onAddToStroke(worldPoint);
        }
        
        if (lastPosition.current && lastBodyPart.current) {
          interpolateMarks(lastPosition.current, worldPosition, lastBodyPart.current, 'whiteboard', moveIntersect, 'whiteboard');
        }
        
        lastPosition.current = worldPosition.clone();
        lastBodyPart.current = 'whiteboard';
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, addMarkAtPosition, onAddToStroke, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects]);

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
