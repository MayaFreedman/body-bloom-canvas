
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group, Color } from 'three';
import * as THREE from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
  children?: React.ReactNode;
}

// Color correction function to make 3D colors match UI colors better
const correctColorFor3D = (hexColor: string): string => {
  const color = new Color(hexColor);
  
  // Convert to HSL for easier manipulation
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  
  // Increase saturation and lightness to compensate for 3D rendering
  hsl.s = Math.min(1, hsl.s * 1.3); // Boost saturation by 30%
  hsl.l = Math.min(0.9, hsl.l * 1.2); // Boost lightness by 20% but cap at 90%
  
  // Convert back to hex
  color.setHSL(hsl.h, hsl.s, hsl.l);
  return `#${color.getHexString()}`;
};

export const HumanModel = ({ bodyPartColors = {}, children }: HumanModelProps) => {
  const groupRef = useRef<Group>(null);
  const breathingGroupRef = useRef<Group>(null);
  const { scene } = useGLTF('/body.glb');
  const originalColors = useRef<{ [key: string]: string }>({});

  // Subtle breathing animation - slower and more gentle
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.08) * 0.004 + 1;
    if (breathingGroupRef.current) {
      breathingGroupRef.current.scale.setScalar(breathe);
      // Debug logging
      if (Math.floor(state.clock.elapsedTime * 10) % 30 === 0) {
        console.log('🫁 Breathing scale:', breathe, 'Children count:', React.Children.count(children));
      }
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

          const meshName = child.name.toLowerCase();
          let bodyPart = null;
          
          for (const [key, value] of Object.entries(bodyPartMapping)) {
            if (meshName.includes(key.toLowerCase()) || child.name === key) {
              bodyPart = value;
              break;
            }
          }
          
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
          
          child.userData.bodyPart = bodyPart || child.name || 'body';
          
          console.log(`Mesh: ${child.name}, assigned bodyPart: ${child.userData.bodyPart}`);
          
          // Apply colors with correction if specified, otherwise reset to original
          if (child.material) {
            const selectedColor = bodyPartColors[child.userData.bodyPart];
            
            if (selectedColor) {
              // Apply color correction to make 3D colors match UI colors better
              const correctedColor = correctColorFor3D(selectedColor);
              
              // Apply color to existing material instead of replacing it
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if ('color' in mat) {
                    mat.color.set(correctedColor);
                  }
                });
              } else if ('color' in child.material) {
                child.material.color.set(correctedColor);
              }
            } else {
              // Reset to original color
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
      <group ref={breathingGroupRef}>
        <primitive object={scene} />
        {children}
      </group>
    </group>
  );
};

// Preload the GLB model
useGLTF.preload('/body.glb');
