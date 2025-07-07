import React from 'react';
import * as THREE from 'three';

interface WhiteboardPlaneProps {
  visible?: boolean;
}

export const WhiteboardPlane = ({ visible = false }: WhiteboardPlaneProps) => {
  return (
    <mesh
      position={[0, 0, -1]} // Behind the body model
      userData={{ isWhiteboard: true }}
      visible={visible}
    >
      <planeGeometry args={[6, 8]} />
      <meshBasicMaterial 
        color="white" 
        transparent 
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};