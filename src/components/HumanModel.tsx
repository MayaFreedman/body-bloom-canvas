
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group } from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
}

export const HumanModel = ({ bodyPartColors = {} }: HumanModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/src/Assets/body.glb');

  // Subtle breathing animation
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathe);
    }
  });

  // Apply body part colors if any materials need to be modified
  React.useEffect(() => {
    if (scene && Object.keys(bodyPartColors).length > 0) {
      scene.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          // Check if this mesh corresponds to a body part that should be colored
          const bodyPart = child.userData?.bodyPart || child.name;
          if (bodyPartColors[bodyPart]) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if ('color' in mat) {
                  mat.color.set(bodyPartColors[bodyPart]);
                }
              });
            } else if ('color' in child.material) {
              child.material.color.set(bodyPartColors[bodyPart]);
            }
          }
        }
      });
    }
  }, [scene, bodyPartColors]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the GLB model
useGLTF.preload('/src/Assets/body.glb');
