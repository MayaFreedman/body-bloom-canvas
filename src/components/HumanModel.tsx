
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
}

export const HumanModel = ({ bodyPartColors = {} }: HumanModelProps) => {
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

  const getPartColor = (partName: string) => {
    return bodyPartColors[partName] || '#d1d5db'; // Light gray color
  };

  return (
    <group position={[0, -1, 0]}>
      {/* Head */}
      <mesh 
        ref={headRef} 
        position={[0, 1.8, 0]}
        userData={{ bodyPart: 'head' }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial color={getPartColor('head')} />
      </mesh>
      
      {/* Torso */}
      <mesh 
        ref={bodyRef} 
        position={[0, 0.8, 0]}
        userData={{ bodyPart: 'torso' }}
      >
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshPhongMaterial color={getPartColor('torso')} />
      </mesh>
      
      {/* Left Arm */}
      <mesh 
        ref={leftArmRef} 
        position={[-0.6, 0.8, 0]} 
        rotation={[0, 0, 0.3]}
        userData={{ bodyPart: 'leftArm' }}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshPhongMaterial color={getPartColor('leftArm')} />
      </mesh>
      
      {/* Right Arm */}
      <mesh 
        ref={rightArmRef} 
        position={[0.6, 0.8, 0]} 
        rotation={[0, 0, -0.3]}
        userData={{ bodyPart: 'rightArm' }}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshPhongMaterial color={getPartColor('rightArm')} />
      </mesh>
      
      {/* Left Leg */}
      <mesh 
        ref={leftLegRef} 
        position={[-0.25, -0.6, 0]}
        userData={{ bodyPart: 'leftLeg' }}
      >
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshPhongMaterial color={getPartColor('leftLeg')} />
      </mesh>
      
      {/* Right Leg */}
      <mesh 
        ref={rightLegRef} 
        position={[0.25, -0.6, 0]}
        userData={{ bodyPart: 'rightLeg' }}
      >
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshPhongMaterial color={getPartColor('rightLeg')} />
      </mesh>
      
      {/* Wireframe outline for better definition */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshBasicMaterial color="#e0e0e0" wireframe />
      </mesh>
    </group>
  );
};
