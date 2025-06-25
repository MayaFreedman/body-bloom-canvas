import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group } from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
}

export const HumanModel = ({ bodyPartColors = {} }: HumanModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/body.glb');

  // Subtle breathing animation
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathe);
    }
  });

  // Set up body part identification and apply colors
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof Mesh) {
          // Map mesh names to body parts - adjust these based on actual mesh names in your GLB
          const nameMappings: { [key: string]: string } = {
            'head': 'head',
            'Head': 'head',
            'torso': 'torso',
            'Torso': 'torso',
            'chest': 'torso',
            'Chest': 'torso',
            'body': 'torso',
            'Body': 'torso',
            'rightarm': 'rightArm',
            'RightArm': 'rightArm',
            'right_arm': 'rightArm',
            'Right_Arm': 'rightArm',
            'leftarm': 'leftArm',
            'LeftArm': 'leftArm',
            'left_arm': 'leftArm',
            'Left_Arm': 'leftArm',
            'rightleg': 'rightLeg',
            'RightLeg': 'rightLeg',
            'right_leg': 'rightLeg',
            'Right_Leg': 'rightLeg',
            'leftleg': 'leftLeg',
            'LeftLeg': 'leftLeg',
            'left_leg': 'leftLeg',
            'Left_Leg': 'leftLeg'
          };

          // Set userData.bodyPart based on mesh name
          const meshName = child.name.toLowerCase();
          let bodyPart = null;

          // Try exact match first
          if (nameMappings[child.name]) {
            bodyPart = nameMappings[child.name];
          } else if (nameMappings[meshName]) {
            bodyPart = nameMappings[meshName];
          } else {
            // Try partial matches
            if (meshName.includes('head')) {
              bodyPart = 'head';
            } else if (meshName.includes('torso') || meshName.includes('chest') || meshName.includes('body')) {
              bodyPart = 'torso';
            } else if (meshName.includes('rightarm') || meshName.includes('right_arm')) {
              bodyPart = 'rightArm';
            } else if (meshName.includes('leftarm') || meshName.includes('left_arm')) {
              bodyPart = 'leftArm';
            } else if (meshName.includes('rightleg') || meshName.includes('right_leg')) {
              bodyPart = 'rightLeg';
            } else if (meshName.includes('leftleg') || meshName.includes('left_leg')) {
              bodyPart = 'leftLeg';
            }
          }

          if (bodyPart) {
            child.userData.bodyPart = bodyPart;
            console.log(`Mapped mesh "${child.name}" to body part "${bodyPart}"`);
          }

          // Apply colors if specified
          if (bodyPart && bodyPartColors[bodyPart] && child.material) {
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
useGLTF.preload('/body.glb');
