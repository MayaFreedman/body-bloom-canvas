
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

  // Helper function to check if ray passes near a mesh (for brush-based intersection)
  const findBrushIntersection = useCallback((meshes: THREE.Mesh[]) => {
    const brushRadius = brushSize * 10.0; // Increased intensity 1000x for testing
    const rayOrigin = new THREE.Vector3();
    const rayDirection = new THREE.Vector3();
    
    raycaster.ray.at(0, rayOrigin);
    rayDirection.copy(raycaster.ray.direction);
    
    // First try normal intersection
    const normalIntersects = raycaster.intersectObjects(meshes, false);
    if (normalIntersects.length > 0) {
      return normalIntersects[0];
    }
    
    // If no direct hit, check if ray passes within brush radius of any mesh
    for (const mesh of meshes) {
      const meshCenter = new THREE.Vector3();
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) {
        mesh.geometry.boundingBox.getCenter(meshCenter);
        mesh.localToWorld(meshCenter);
        
        // Calculate distance from ray to mesh center
        const closestPoint = new THREE.Vector3();
        const ray = raycaster.ray;
        const toMesh = meshCenter.clone().sub(rayOrigin);
        const projectionLength = toMesh.dot(rayDirection);
        
        if (projectionLength > 0) {
          closestPoint.copy(rayDirection).multiplyScalar(projectionLength).add(rayOrigin);
          const distance = closestPoint.distanceTo(meshCenter);
          
          if (distance <= brushRadius) {
            // Create a fake intersection at the closest point on the mesh surface
            const fakeIntersect: THREE.Intersection = {
              distance: projectionLength,
              point: meshCenter.clone(),
              object: mesh,
              face: null,
              faceIndex: undefined,
              uv: undefined,
              uv1: undefined,
              normal: undefined,
              instanceId: undefined
            };
            return fakeIntersect;
          }
        }
      }
    }
    
    return null;
  }, [brushSize, raycaster]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing || mode === 'sensation') return;
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
    
    const intersect = findBrushIntersection(meshes);
    console.log('🎯 Brush intersection result:', intersect ? 'HIT' : 'MISS');

    if (intersect) {
      
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
      console.log('❌ No brush intersection found for', drawingTarget);
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, onAddToStroke, camera, gl, raycaster, mouse, getIntersectedObjects, drawingTarget, findBrushIntersection]);

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
    
    const meshes = getIntersectedObjects(drawingTarget === 'whiteboard');
    const intersect = findBrushIntersection(meshes);

    if (intersect) {
      
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
  }, [isDrawing, addMarkAtPosition, onAddToStroke, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects, findBrushIntersection]);

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
