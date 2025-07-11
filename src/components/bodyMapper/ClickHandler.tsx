
import React, { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface ClickHandlerProps {
  mode: BodyMapperMode;
  selectedColor: string;
  selectedSensation?: SelectedSensation | null;
  drawingTarget: 'body' | 'whiteboard';
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onWhiteboardFill?: (color: string) => void;
  onTextPlace?: (position: THREE.Vector3, surface: 'body' | 'whiteboard') => void;
}

export const ClickHandler = ({ 
  mode, 
  selectedColor, 
  selectedSensation, 
  drawingTarget,
  onBodyPartClick, 
  onSensationClick,
  onWhiteboardFill,
  onTextPlace
}: ClickHandlerProps) => {
  const { camera, gl, raycaster, mouse, scene } = useThree();

  const getBodyMeshes = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.bodyPart) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [scene]);

  const getWhiteboardMeshes = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isWhiteboard) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [scene]);

  const handleClick = useCallback((event: MouseEvent) => {
    
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Check whiteboard clicks first if targeting whiteboard
    if (drawingTarget === 'whiteboard') {
      const whiteboardMeshes = getWhiteboardMeshes();
      const whiteboardIntersects = raycaster.intersectObjects(whiteboardMeshes, false);
      
      if (whiteboardIntersects.length > 0) {
        const intersectedObject = whiteboardIntersects[0].object;
        
        if (intersectedObject.userData.isWhiteboard) {
          // PRIORITY 1: If in text mode, place text on whiteboard
          if (mode === 'text' && onTextPlace) {
            onTextPlace(whiteboardIntersects[0].point, 'whiteboard');
            return;
          }
          
          // PRIORITY 2: If in sensation mode, place sensation on whiteboard
          if (mode === 'sensation' && selectedSensation) {
            onSensationClick(whiteboardIntersects[0].point, selectedSensation);
            return;
          }
          
          // PRIORITY 3: If mode is fill, fill whiteboard background
          if (mode === 'fill' && onWhiteboardFill) {
            onWhiteboardFill(selectedColor);
            return;
          }
          
          // PRIORITY 4: If mode is clearFill, clear whiteboard background
          if (mode === 'clearFill' && onWhiteboardFill) {
            onWhiteboardFill('#ffffff'); // Reset to white
            return;
          }
        }
      }
    }

    // Get all body meshes for body interactions
    const bodyMeshes = getBodyMeshes();
    const intersects = raycaster.intersectObjects(bodyMeshes, false);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const intersect = intersects[0];
      
      if (intersectedObject.userData.bodyPart) {
        // PRIORITY 1: If in text mode, place text on body
        if (mode === 'text' && onTextPlace) {
          // Convert world position to local position relative to the model (same as sensations)
          const modelGroup = scene.children.find(child => child.type === 'Group');
          if (modelGroup) {
            const localPosition = new THREE.Vector3();
            modelGroup.worldToLocal(localPosition.copy(intersect.point));
            onTextPlace(localPosition, 'body');
          }
          return;
        }
        
        // PRIORITY 2: If in sensation mode and sensation is equipped, place it
        if (mode === 'sensation' && selectedSensation) {
          // Convert world position to local position relative to the model
          const modelGroup = scene.children.find(child => child.type === 'Group');
          if (modelGroup) {
            const localPosition = new THREE.Vector3();
            modelGroup.worldToLocal(localPosition.copy(intersect.point));
            onSensationClick(localPosition, selectedSensation);
          }
          return; // Exit early after placing sensation
        }
        
        // PRIORITY 3: If mode is fill, do body part filling
        if (mode === 'fill') {
          onBodyPartClick(intersectedObject.userData.bodyPart, selectedColor);
          return;
        }
        
        // PRIORITY 4: If mode is clearFill, clear body part fill
        if (mode === 'clearFill') {
          onBodyPartClick(intersectedObject.userData.bodyPart, 'CLEAR_FILL');
          return;
        }
      }
    }
  }, [mode, selectedColor, selectedSensation, onBodyPartClick, onSensationClick, camera, gl, raycaster, mouse, getBodyMeshes, scene]);

  React.useEffect(() => {
    // Listen for clicks if in sensation mode, fill mode, clearFill mode, text mode, or other non-drawing modes
    if (mode === 'sensation' || mode === 'fill' || mode === 'clearFill' || mode === 'text' || (mode !== 'draw')) {
      gl.domElement.addEventListener('click', handleClick);
      return () => gl.domElement.removeEventListener('click', handleClick);
    }
  }, [handleClick, gl, mode]);

  return null;
};
