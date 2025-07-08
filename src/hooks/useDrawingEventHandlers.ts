
import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface UseDrawingEventHandlersProps {
  isDrawing: boolean;
  drawingTarget: 'body' | 'whiteboard';
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  getIntersectedObjects: (includeWhiteboard?: boolean) => THREE.Mesh[];
  addMarkAtPosition: (worldPosition: THREE.Vector3, intersect?: THREE.Intersection, surface?: 'body' | 'whiteboard') => void;
  interpolateMarks: (start: THREE.Vector3, end: THREE.Vector3, startBodyPart: string, endBodyPart: string, endIntersect?: THREE.Intersection, surface?: 'body' | 'whiteboard') => void;
}

export const useDrawingEventHandlers = ({
  isDrawing,
  drawingTarget,
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
    if (!isDrawing) return;
    console.log('🖱️ Pointer down - starting drawing, target:', drawingTarget);
    isMouseDown.current = true;
    strokeStarted.current = false;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Include whiteboard in intersection detection based on drawing target
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    console.log('🎯 Found meshes for intersection:', meshes.length, 'includeWhiteboard:', drawingTarget === 'whiteboard');
    meshes.forEach((mesh, i) => {
      console.log(`  Mesh ${i}:`, mesh.userData.bodyPart || 'whiteboard', mesh.userData);
    });
    
    const intersects = raycaster.intersectObjects(meshes, false);
    console.log('🎯 Raycaster intersections:', intersects.length);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      // Handle body part intersection
      if (intersect.object.userData.bodyPart && drawingTarget === 'body') {
        console.log('✅ Hit body part:', intersect.object.userData.bodyPart);
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
        console.log('✅ Hit whiteboard at:', intersect.point, 'object userData:', intersect.object.userData);
        if (onStrokeStart && !strokeStarted.current) {
          console.log('🎬 Starting whiteboard stroke');
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
      console.log('❌ No valid intersection found for', drawingTarget);
      if (intersects.length > 0) {
        console.log('  First intersect object userData:', intersects[0].object.userData);
      }
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, onAddToStroke, camera, gl, raycaster, mouse, getIntersectedObjects, drawingTarget]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    const now = Date.now();
    
    // Enhanced throttling for smoother drawing - optimized for responsiveness
    const THROTTLE_TIME = 6; // Reduced from 8ms to 6ms for even smoother feel
    if (now - lastMarkTime.current < THROTTLE_TIME) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
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
  }, [isDrawing, addMarkAtPosition, onAddToStroke, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    console.log('🖱️ Pointer up - ending drawing');
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
