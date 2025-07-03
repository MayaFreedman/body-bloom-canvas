
import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';

interface LineStroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  width: number;
}

interface UseLineDrawingEventsProps {
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
  onAddStroke: (stroke: LineStroke) => void;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const useLineDrawingEvents = ({
  isDrawing,
  selectedColor,
  brushSize,
  onAddStroke,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  modelRef
}: UseLineDrawingEventsProps) => {
  const { camera, gl, raycaster, mouse } = useThree();
  const isMouseDown = useRef(false);
  const currentStroke = useRef<LineStroke | null>(null);
  const lastMarkTime = useRef(0);

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

  const addPointToStroke = useCallback((worldPosition: THREE.Vector3, intersect?: THREE.Intersection) => {
    const modelGroup = modelRef?.current;
    if (modelGroup && currentStroke.current) {
      const localPosition = new THREE.Vector3();
      modelGroup.worldToLocal(localPosition.copy(worldPosition));
      
      currentStroke.current.points.push(localPosition.clone());
      
      if (onAddToStroke && intersect && intersect.object instanceof THREE.Mesh) {
        const worldPoint: WorldDrawingPoint = {
          id: `point-${Date.now()}-${Math.random()}`,
          worldPosition: {
            x: worldPosition.x,
            y: worldPosition.y,
            z: worldPosition.z
          },
          bodyPart: intersect.object.userData.bodyPart,
          color: selectedColor,
          size: brushSize / 200
        };
        onAddToStroke(worldPoint);
      }
    }
  }, [selectedColor, brushSize, onAddToStroke, modelRef]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      if (intersect.object.userData.bodyPart) {
        // Start new stroke
        currentStroke.current = {
          id: `stroke-${Date.now()}-${Math.random()}`,
          points: [],
          color: selectedColor,
          width: brushSize / 200
        };
        
        if (onStrokeStart) {
          onStrokeStart();
        }
        
        addPointToStroke(intersect.point, intersect);
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, addPointToStroke, onStrokeStart, camera, gl, raycaster, mouse, getIntersectedObjects, selectedColor, brushSize]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current || !currentStroke.current) return;
    
    const now = Date.now();
    if (now - lastMarkTime.current < 16) return; // Throttle to ~60fps

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      if (intersect.object.userData.bodyPart) {
        addPointToStroke(intersect.point, intersect);
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, addPointToStroke, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    if (isMouseDown.current && currentStroke.current) {
      if (currentStroke.current.points.length >= 2) {
        onAddStroke(currentStroke.current);
      }
      
      if (onStrokeComplete) {
        onStrokeComplete();
      }
    }
    
    isMouseDown.current = false;
    currentStroke.current = null;
  }, [onAddStroke, onStrokeComplete]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
};
