
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

  // Check if direct hit is too close to edge based on brush size
  const findBrushIntersection = useCallback((meshes: THREE.Mesh[]) => {
    const edgeThreshold = brushSize * 0.0001; // Distance from edge to consider a "miss"
    console.log('🖌️ BRUSH DEBUG: brushSize:', brushSize, 'edgeThreshold:', edgeThreshold);
    
    // First, try normal intersections
    const normalIntersects = raycaster.intersectObjects(meshes, false);
    console.log('🎯 NORMAL INTERSECTS:', normalIntersects.length);
    
    if (normalIntersects.length > 0) {
      const hit = normalIntersects[0];
      console.log('✅ DIRECT HIT found - checking if too close to edge');
      
      // Check if hit point is too close to mesh edge
      const mesh = hit.object as THREE.Mesh;
      const geometry = mesh.geometry;
      
      if (geometry && geometry.boundingBox) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        
        // Transform hit point to local mesh coordinates
        const localPoint = hit.point.clone();
        mesh.worldToLocal(localPoint);
        
        // Calculate distance to nearest edge
        const distToEdgeX = Math.min(
          Math.abs(localPoint.x - box.min.x),
          Math.abs(localPoint.x - box.max.x)
        );
        const distToEdgeY = Math.min(
          Math.abs(localPoint.y - box.min.y),
          Math.abs(localPoint.y - box.max.y)
        );
        const distToEdgeZ = Math.min(
          Math.abs(localPoint.z - box.min.z),
          Math.abs(localPoint.z - box.max.z)
        );
        
        const minDistToEdge = Math.min(distToEdgeX, distToEdgeY, distToEdgeZ);
        
        console.log(`🏃 Edge distances: X=${distToEdgeX.toFixed(3)}, Y=${distToEdgeY.toFixed(3)}, Z=${distToEdgeZ.toFixed(3)}`);
        console.log(`📏 Min edge distance: ${minDistToEdge.toFixed(3)}, threshold: ${edgeThreshold.toFixed(3)}`);
        
        if (minDistToEdge < edgeThreshold) {
          console.log('❌ TOO CLOSE TO EDGE - treating as miss');
          return null; // Treat as miss if too close to edge
        }
      }
      
      console.log('✅ GOOD HIT - not too close to edge');
      return hit; // Good hit, not too close to edge
    }
    
    console.log('❌ NO DIRECT HIT');
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
