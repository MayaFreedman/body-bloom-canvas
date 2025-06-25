
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

  const addMarkAtPoint = useCallback((event: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Get intersections with body meshes
    const meshes = getIntersectedObjects();
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const modelGroup = modelRef?.current;
      
      if (modelGroup && intersect.object.userData.bodyPart) {
        // Convert world position to local position relative to the model
        const localPosition = new THREE.Vector3();
        modelGroup.worldToLocal(localPosition.copy(intersect.point));
        
        const mark: DrawingMark = {
          id: `mark-${Date.now()}-${Math.random()}`,
          position: localPosition,
          color: selectedColor,
          size: brushSize / 100
        };
        onAddMark(mark);
        lastMarkTime.current = Date.now();
      }
    }
  }, [selectedColor, brushSize, onAddMark, camera, gl, raycaster, mouse, getIntersectedObjects, modelRef]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    addMarkAtPoint(event);
  }, [isDrawing, addMarkAtPoint]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    // Reduce throttle delay for smoother strokes (from 50ms to 16ms for ~60fps)
    const now = Date.now();
    if (now - lastMarkTime.current < 16) return;

    addMarkAtPoint(event);
  }, [isDrawing, addMarkAtPoint]);

  const handlePointerUp = useCallback(() => {
    isMouseDown.current = false;
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
