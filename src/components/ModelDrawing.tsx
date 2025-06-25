
import React, { useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface ModelDrawingProps {
  isDrawing: boolean;
  drawingMarks: DrawingMark[];
  selectedColor: string;
  brushSize: number;
  onAddMark: (mark: DrawingMark) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const ModelDrawing = ({ 
  isDrawing, 
  drawingMarks, 
  selectedColor, 
  brushSize, 
  onAddMark,
  modelRef 
}: ModelDrawingProps) => {
  const { camera, gl, raycaster, mouse, scene } = useThree();
  const isMouseDown = useRef(false);
  const lastMarkTime = useRef(0);
  const lastPosition = useRef<THREE.Vector3 | null>(null);

  const getIntersectedObjects = useCallback(() => {
    // Get all meshes from the model that have bodyPart userData
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

  const addMarkAtPosition = useCallback((worldPosition: THREE.Vector3) => {
    const modelGroup = modelRef?.current;
    if (modelGroup) {
      // Convert world position to local position relative to the model
      const localPosition = new THREE.Vector3();
      modelGroup.worldToLocal(localPosition.copy(worldPosition));
      
      const mark: DrawingMark = {
        id: `mark-${Date.now()}-${Math.random()}`,
        position: localPosition,
        color: selectedColor,
        size: brushSize / 100
      };
      onAddMark(mark);
    }
  }, [selectedColor, brushSize, onAddMark, modelRef]);

  const interpolateMarks = useCallback((start: THREE.Vector3, end: THREE.Vector3) => {
    const distance = start.distanceTo(end);
    const steps = Math.max(1, Math.floor(distance * 50)); // More steps for smoother lines
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, t);
      addMarkAtPosition(interpolatedPosition);
    }
  }, [addMarkAtPosition]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Get intersections with body meshes
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      if (intersect.object.userData.bodyPart) {
        addMarkAtPosition(intersect.point);
        lastPosition.current = intersect.point.clone();
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, addMarkAtPosition, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    // Reduce throttle for smoother drawing (60fps)
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
        
        // If we have a last position, interpolate between them for smooth strokes
        if (lastPosition.current) {
          interpolateMarks(lastPosition.current, currentPosition);
        } else {
          addMarkAtPosition(currentPosition);
        }
        
        lastPosition.current = currentPosition.clone();
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, addMarkAtPosition, interpolateMarks, camera, gl, raycaster, mouse, getIntersectedObjects]);

  const handlePointerUp = useCallback(() => {
    isMouseDown.current = false;
    lastPosition.current = null;
  }, []);

  React.useEffect(() => {
    if (isDrawing) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointerleave', handlePointerUp);
      
      // Change cursor when in drawing mode
      gl.domElement.style.cursor = 'crosshair';
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
        gl.domElement.removeEventListener('pointerleave', handlePointerUp);
        gl.domElement.style.cursor = 'default';
      };
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isDrawing, handlePointerDown, handlePointerMove, handlePointerUp, gl]);

  // Return null - the marks will be rendered as children of the model group
  return null;
};
