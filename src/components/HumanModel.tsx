
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group, MeshBasicMaterial } from 'three';
import * as THREE from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
}

export const HumanModel = ({ bodyPartColors = {} }: HumanModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/body.glb');
  const originalColors = useRef<{ [key: string]: string }>({});

  // Subtle breathing animation
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breathe);
    }
  });

  // Set up body parts with proper userData and apply colors
  React.useEffect(() => {
    if (scene) {
      // Define mapping of mesh names to body parts
      const bodyPartMapping: { [key: string]: string } = {
        'head': 'head',
        'Head': 'head',
        'torso': 'torso',
        'Torso': 'torso',
        'chest': 'torso',
        'Chest': 'torso',
        'body': 'torso',
        'Body': 'torso',
        'leftarm': 'leftArm',
        'LeftArm': 'leftArm',
        'left_arm': 'leftArm',
        'Left_Arm': 'leftArm',
        'rightarm': 'rightArm',
        'RightArm': 'rightArm',
        'right_arm': 'rightArm',
        'Right_Arm': 'rightArm',
        'leftleg': 'leftLeg',
        'LeftLeg': 'leftLeg',
        'left_leg': 'leftLeg',
        'Left_Leg': 'leftLeg',
        'rightleg': 'rightLeg',
        'RightLeg': 'rightLeg',
        'right_leg': 'rightLeg',
        'Right_Leg': 'rightLeg'
      };

      scene.traverse((child) => {
        if (child instanceof Mesh) {
          // Store original colors if not already stored
          if (!originalColors.current[child.uuid] && child.material) {
            if (Array.isArray(child.material)) {
              if (child.material[0] && 'color' in child.material[0]) {
                originalColors.current[child.uuid] = `#${child.material[0].color.getHexString()}`;
              }
            } else if ('color' in child.material) {
              originalColors.current[child.uuid] = `#${child.material.color.getHexString()}`;
            }
          }

          // Set userData.bodyPart for all meshes
          const meshName = child.name.toLowerCase();
          let bodyPart = null;
          
          // Try to match mesh name to body part
          for (const [key, value] of Object.entries(bodyPartMapping)) {
            if (meshName.includes(key.toLowerCase()) || child.name === key) {
              bodyPart = value;
              break;
            }
          }
          
          // If no specific match, try broader matching
          if (!bodyPart) {
            if (meshName.includes('head') || meshName.includes('skull')) {
              bodyPart = 'head';
            } else if (meshName.includes('torso') || meshName.includes('chest') || meshName.includes('body')) {
              bodyPart = 'torso';
            } else if (meshName.includes('arm')) {
              if (meshName.includes('left') || meshName.includes('l_')) {
                bodyPart = 'leftArm';
              } else if (meshName.includes('right') || meshName.includes('r_')) {
                bodyPart = 'rightArm';
              }
            } else if (meshName.includes('leg')) {
              if (meshName.includes('left') || meshName.includes('l_')) {
                bodyPart = 'leftLeg';
              } else if (meshName.includes('right') || meshName.includes('r_')) {
                bodyPart = 'rightLeg';
              }
            }
          }
          
          // Set userData.bodyPart or fallback to mesh name
          child.userData.bodyPart = bodyPart || child.name || 'body';
          
          console.log(`Mesh: ${child.name}, assigned bodyPart: ${child.userData.bodyPart}`);
          
          // Apply colors if specified, otherwise reset to original
          if (child.material) {
            const selectedColor = bodyPartColors[child.userData.bodyPart];
            
            if (selectedColor) {
              // Use MeshBasicMaterial for filled parts to show true colors
              const basicMaterial = new THREE.MeshBasicMaterial({ color: selectedColor });
              child.material = basicMaterial;
            } else {
              // Reset to original color and material type
              const originalColor = originalColors.current[child.uuid];
              if (originalColor) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if ('color' in mat) {
                      mat.color.set(originalColor);
                    }
                  });
                } else if ('color' in child.material) {
                  child.material.color.set(originalColor);
                }
              }
            }
          }
        }
      });
    }
  }, [scene, bodyPartColors]);

  return (
    <group ref={groupRef} position={[0, -1, 0]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// Preload the GLB model
useGLTF.preload('/body.glb');
