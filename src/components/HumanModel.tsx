
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export const HumanModel = () => {
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);

  // Subtle breathing animation
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
    if (bodyRef.current) {
      bodyRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Torso */}
      <mesh ref={bodyRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.6, 0.8, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.6, 0.8, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.25, -0.6, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.25, -0.6, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshPhongMaterial color="#fdbcb4" transparent opacity={0.9} />
      </mesh>
      
      {/* Wireframe outline for better definition */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshBasicMaterial color="#e0e0e0" wireframe />
      </mesh>
    </group>
  );
};
