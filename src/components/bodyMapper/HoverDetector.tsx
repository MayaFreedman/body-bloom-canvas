import React, { useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HoverDetectorProps {
  onHoverChange: (isHovering: boolean) => void;
}

export const HoverDetector = ({ onHoverChange }: HoverDetectorProps) => {
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

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Get all body meshes
    const bodyMeshes = getBodyMeshes();
    const intersects = raycaster.intersectObjects(bodyMeshes, false);

    const isHovering = intersects.length > 0;
    console.log('🎯 HoverDetector:', {
      bodyMeshesCount: bodyMeshes.length,
      intersectsCount: intersects.length,
      isHovering,
      mousePos: { x: mouse.x, y: mouse.y }
    });

    onHoverChange(isHovering);
  }, [camera, gl, raycaster, mouse, getBodyMeshes, onHoverChange]);

  useEffect(() => {
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    
    // Clean up hover state when mouse leaves the canvas
    const handleMouseLeave = () => onHoverChange(false);
    gl.domElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, gl, onHoverChange]);

  return null;
};