
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

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isDrawing) return;
    isMouseDown.current = true;
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Find intersections with the model
    const modelGroup = modelRef?.current || scene;
    const intersects = raycaster.intersectObjects(modelGroup.children, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.object.userData.bodyPart) {
        // Convert world position to local position relative to the model
        const localPosition = new THREE.Vector3();
        modelGroup.worldToLocal(localPosition.copy(intersect.point));
        
        const mark: DrawingMark = {
          id: `mark-${Date.now()}-${Math.random()}`,
          position: localPosition, // Use local position instead of world position
          color: selectedColor,
          size: brushSize / 100
        };
        onAddMark(mark);
        lastMarkTime.current = Date.now();
      }
    }
  }, [isDrawing, selectedColor, brushSize, onAddMark, camera, gl, raycaster, mouse, scene, modelRef]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !isMouseDown.current) return;
    
    // Throttle drawing to avoid too many marks
    const now = Date.now();
    if (now - lastMarkTime.current < 50) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const modelGroup = modelRef?.current || scene;
    const intersects = raycaster.intersectObjects(modelGroup.children, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.object.userData.bodyPart) {
        // Convert world position to local position relative to the model
        const localPosition = new THREE.Vector3();
        modelGroup.worldToLocal(localPosition.copy(intersect.point));
        
        const mark: DrawingMark = {
          id: `mark-${Date.now()}-${Math.random()}`,
          position: localPosition, // Use local position instead of world position
          color: selectedColor,
          size: brushSize / 100
        };
        onAddMark(mark);
        lastMarkTime.current = now;
      }
    }
  }, [isDrawing, selectedColor, brushSize, onAddMark, camera, gl, raycaster, mouse, scene, modelRef]);

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
