import React from 'react';
import * as THREE from 'three';

interface WhiteboardPlaneProps {
  visible?: boolean;
  backgroundColor?: string;
}

export const WhiteboardPlane = ({ visible = false, backgroundColor = 'white' }: WhiteboardPlaneProps) => {
  
  
  return (
    <mesh
      position={[0, 0, -0.5]} // Closer to camera for better intersection
      userData={{ isWhiteboard: true }}
      visible={visible}
    >
      <planeGeometry args={[6, 8]} />
      <meshBasicMaterial 
        color={backgroundColor} 
        side={THREE.DoubleSide}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
};