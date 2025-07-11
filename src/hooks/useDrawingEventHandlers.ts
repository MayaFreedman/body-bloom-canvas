
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

  // Find the closest mesh within brush radius - prioritize direct hits
  const findBrushIntersection = useCallback((meshes: THREE.Mesh[]) => {
    const brushRadius = brushSize * 0.1; // Much more reasonable brush expansion
    console.log('🖌️ BRUSH DEBUG: brushSize:', brushSize, 'brushRadius:', brushRadius);
    
    const rayOrigin = new THREE.Vector3();
    const rayDirection = new THREE.Vector3();
    
    raycaster.ray.at(0, rayOrigin);
    rayDirection.copy(raycaster.ray.direction);
    
    // Try normal intersection first - if hit, that's always best
    const normalIntersects = raycaster.intersectObjects(meshes, false);
    console.log('🎯 NORMAL INTERSECTS:', normalIntersects.length);
    
    if (normalIntersects.length > 0) {
      console.log('✅ DIRECT HIT - using normal intersection');
      return normalIntersects[0];
    }
    
    console.log('🔍 NO DIRECT HIT - checking brush radius:', brushRadius);
    
    // Find closest mesh within brush radius
    let closestMesh: THREE.Mesh | null = null;
    let closestDistance = Infinity;
    let closestPoint = new THREE.Vector3();
    
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      console.log(`  Checking mesh ${i}:`, mesh.userData.bodyPart || 'whiteboard');
      
      const meshCenter = new THREE.Vector3();
      mesh.geometry.computeBoundingBox();
      if (mesh.geometry.boundingBox) {
        mesh.geometry.boundingBox.getCenter(meshCenter);
        mesh.localToWorld(meshCenter);
        
        // Calculate closest point on ray to mesh center
        const toMesh = meshCenter.clone().sub(rayOrigin);
        const projectionLength = toMesh.dot(rayDirection);
        
        if (projectionLength > 0) {
          const rayPoint = new THREE.Vector3().copy(rayDirection).multiplyScalar(projectionLength).add(rayOrigin);
          const distance = rayPoint.distanceTo(meshCenter);
          
          console.log(`    Distance to ray: ${distance.toFixed(3)}, brushRadius: ${brushRadius.toFixed(3)}`);
          
          if (distance <= brushRadius && distance < closestDistance) {
            closestDistance = distance;
            closestMesh = mesh;
            closestPoint.copy(meshCenter); // Use mesh center as intersection point
            console.log('🎯 NEW CLOSEST MESH:', mesh.userData.bodyPart || 'whiteboard', 'distance:', distance.toFixed(3));
          }
        }
      }
    }
    
    if (closestMesh) {
      console.log('🎉 BRUSH HIT! Closest mesh:', closestMesh.userData.bodyPart || 'whiteboard');
      const fakeIntersect: THREE.Intersection = {
        distance: closestDistance,
        point: closestPoint,
        object: closestMesh,
        face: null,
        faceIndex: undefined,
        uv: undefined,
        uv1: undefined,
        normal: undefined,
        instanceId: undefined
      };
      return fakeIntersect;
    }
    
    console.log('❌ NO MESH WITHIN BRUSH RADIUS');
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
    
    const intersect = findBrushIntersection(meshes);
    

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
    
    // Only complete strokes when actually in drawing mode
    if (isMouseDown.current && strokeStarted.current && mode === 'draw') {
      
      if (onStrokeComplete) {
        onStrokeComplete();
      }
    } else {
      
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
