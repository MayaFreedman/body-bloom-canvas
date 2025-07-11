
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
    
    // Expand raycaster detection radius based on brush size
    const brushRadius = brushSize * 0.001; // Convert brush size to world units
    raycaster.params.Points = { threshold: brushRadius };
    raycaster.params.Line = { threshold: brushRadius };
    
    console.log('🎯 Using brush radius for intersection:', brushRadius, 'for brush size:', brushSize);
    
    // Get meshes and check intersections with expanded radius
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    console.log('🎯 Found meshes for intersection:', meshes.length);
    
    const intersects = raycaster.intersectObjects(meshes, false);
    console.log('🎯 Raycaster intersections with brush radius:', intersects.length);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const worldPosition = intersect.point;
      
      // Handle body part intersection
      if (intersect.object.userData.bodyPart && drawingTarget === 'body') {
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
    
    // Expand raycaster detection radius based on brush size (same as pointer down)
    const brushRadius = brushSize * 0.001;
    raycaster.params.Points = { threshold: brushRadius };
    raycaster.params.Line = { threshold: brushRadius };
    
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    const intersects = raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0) {
      const moveIntersect = intersects[0];
      const worldPosition = moveIntersect.point;
      
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
