import React from 'react';
import * as THREE from 'three';

interface WhiteboardPlaneProps {
  visible?: boolean;
  backgroundColor?: string;
}

export const WhiteboardPlane = ({ visible = false, backgroundColor = 'white' }: WhiteboardPlaneProps) => {
  console.log('🖼️ WhiteboardPlane rendering, visible:', visible, 'backgroundColor:', backgroundColor);
  console.log('🖼️ WhiteboardPlane position: [0, 0, -0.5] - should be STATIONARY');
  
  if (visible) {
    console.log('✅ WhiteboardPlane is VISIBLE and ready for drawing');
  }
  
  return (
    <mesh
      position={[0, 0, -0.5]} // Closer to camera for better intersection
      userData={{ isWhiteboard: true }}
      visible={visible}
      rotation={[0, 0, 0]} // Explicitly set no rotation
    >
      <planeGeometry args={[6, 8]} />
      <meshBasicMaterial 
        color={backgroundColor} 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};