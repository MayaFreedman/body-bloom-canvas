
import React, { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface ClickHandlerProps {
  mode: BodyMapperMode;
  selectedColor: string;
  selectedSensation?: SelectedSensation | null;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
}

export const ClickHandler = ({ 
  mode, 
  selectedColor, 
  selectedSensation, 
  onBodyPartClick, 
  onSensationClick 
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

  const handleClick = useCallback((event: MouseEvent) => {
    console.log('🖱️ ClickHandler - Click detected, mode:', mode, 'selectedSensation:', selectedSensation);
    
    if (mode === 'draw') return; // Drawing is handled by ModelDrawing component
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Get all body meshes
    const bodyMeshes = getBodyMeshes();
    const intersects = raycaster.intersectObjects(bodyMeshes, false);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const intersect = intersects[0];
      
      if (intersectedObject.userData.bodyPart) {
        if (mode === 'fill') {
          console.log(`Filling body part: ${intersectedObject.userData.bodyPart} with color: ${selectedColor}`);
          onBodyPartClick(intersectedObject.userData.bodyPart, selectedColor);
          return;
        }
        
        if (selectedSensation) {
          console.log('🎯 ClickHandler - Placing sensation:', selectedSensation.name, 'at body part:', intersectedObject.userData.bodyPart);
          // Convert world position to local position relative to the model
          const modelGroup = scene.children.find(child => child.type === 'Group');
          if (modelGroup) {
            const localPosition = new THREE.Vector3();
            modelGroup.worldToLocal(localPosition.copy(intersect.point));
            console.log('🎯 ClickHandler - Calling onSensationClick with position:', localPosition);
            onSensationClick(localPosition, selectedSensation);
          } else {
            console.error('❌ ClickHandler - Could not find model group');
          }
        } else {
          console.log('⚠️ ClickHandler - No sensation selected');
        }
      }
    }
  }, [mode, selectedColor, selectedSensation, onBodyPartClick, onSensationClick, camera, gl, raycaster, mouse, getBodyMeshes, scene]);

  React.useEffect(() => {
    if (mode !== 'draw') {
      gl.domElement.addEventListener('click', handleClick);
      return () => gl.domElement.removeEventListener('click', handleClick);
    }
  }, [handleClick, gl, mode]);

  return null;
};
