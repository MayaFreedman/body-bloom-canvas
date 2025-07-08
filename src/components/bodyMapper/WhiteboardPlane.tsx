import React from 'react';
import * as THREE from 'three';

interface WhiteboardPlaneProps {
  visible?: boolean;
}

export const WhiteboardPlane = ({ visible = false }: WhiteboardPlaneProps) => {
  console.log('🖼️ WhiteboardPlane rendering, visible:', visible);
  
  return (
    <mesh
      position={[0, 0, -0.5]} // Closer to camera for better intersection
      userData={{ isWhiteboard: true }}
      visible={visible}
    >
      <planeGeometry args={[6, 8]} />
      <meshBasicMaterial 
        color="white" 
        transparent 
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};