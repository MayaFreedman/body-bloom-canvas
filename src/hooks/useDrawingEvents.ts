
import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateSurfaceCoordinates, SurfaceDrawingPoint } from '@/utils/surfaceCoordinates';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface UseDrawingEventsProps {
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
  onAddMark: (mark: DrawingMark) => void;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (surfacePoint: SurfaceDrawingPoint) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const useDrawingEvents = ({
  isDrawing,
  selectedColor,
  brushSize,
  onAddMark,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  modelRef
}: UseDrawingEventsProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);
  const lastMarkTime = useRef(0);
  const lastPosition = useRef<THREE.Vector3 | null>(null);
  const strokeStarted = useRef(false);

  const getIntersectedObjects = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    const modelGroup = modelRef?.current;
    
    if (modelGroup) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.bodyPart) {
          meshes.push(child);
        }
      });
    }
    
    return meshes;
  }, [modelRef]);

  const addMarkAtPosition = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection) => {
    const modelGroup = modelRef?.current;
    if (modelGroup) {
      const localPosition = new THREE.Vector3();
      modelGroup.worldToLocal(localPosition.copy(worldPosition));
      
      const mark: DrawingMark = {
        id: `mark-${Date.now()}-${Math.random()}`,
        position: localPosition,
        color: selectedColor,
        size: brushSize / 100
      };
      onAddMark(mark);
      
      if (onAddToStroke && intersect && intersect.object instanceof THREE.Mesh) {
        const surfaceCoord = calculateSurfaceCoordinates(intersect, intersect.object);
        if (surfaceCoord) {
          const surfacePoint: SurfaceDrawingPoint = {
            id: mark.id,
            surfaceCoord,
            color: selectedColor,
            size: brushSize / 100
          };
          onAddToStroke(surfacePoint);
        }
      }
    }
  }, [selectedColor, brushSize, onAddMark, onAddToStroke, modelRef]);

  const interpolateMarks = useCallback((start: THREE.Vector3, end: THREE.Vector3, startIntersect?: THREE.Intersection, endIntersect?: THREE.Intersection) => {
    const distance = start.distanceTo(end);
    const steps = Math.max(1, Math.floor(distance * 50));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, t);
      addMarkAtPosition(interpolatedPosition, endIntersect);
    }
  }, [addMarkAtPosition]);

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
        
        addMarkAtPosition(intersect.point, intersect);
        lastPosition.current = intersect.point.clone();
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, addMarkAtPosition, onStrokeStart, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    const now = Date.now();
    if (now - lastMarkTime.current < 16) return;

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
        
        if (lastPosition.current) {
          interpolateMarks(lastPosition.current, currentPosition, undefined, intersect);
        } else {
          addMarkAtPosition(currentPosition, intersect);
        }
        
        lastPosition.current = currentPosition.clone();
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
    strokeStarted.current = false;
  }, [onStrokeComplete]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};
