
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Group, Color } from 'three';
import * as THREE from 'three';

interface HumanModelProps {
  bodyPartColors?: { [key: string]: string };
}

// Reverse-engineered color correction based on actual rendered vs expected color patterns
const correctColorFor3D = (hexColor: string): string => {
  const color = new Color(hexColor);
  
  // Convert to HSL for easier manipulation
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  
  // More targeted saturation boost - not too extreme to avoid washout
  hsl.s = Math.min(1, hsl.s * 1.8);
  
  // Aggressive lightness boost - make colors brighter without affecting saturation
  if (hsl.l < 0.4) {
    hsl.l = Math.min(0.75, hsl.l * 2.0); // Strong boost for darker colors
  } else {
    hsl.l = Math.max(0.5, Math.min(0.85, hsl.l * 1.3)); // Moderate boost for lighter colors
  }
  
  // Convert back to hex
  color.setHSL(hsl.h, hsl.s, hsl.l);
  return `#${color.getHexString()}`;
};

export const HumanModel = ({ bodyPartColors = {} }: HumanModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/body.glb');
  const originalColors = useRef<{ [key: string]: string }>({});

  // Subtle breathing animation - slower and more gentle
  useFrame((state) => {
    const breathe = Math.sin(state.clock.elapsedTime * 0.08) * 0.004 + 1; // Reduced frequency from 0.15 to 0.08, amplitude from 0.008 to 0.004
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
              // Apply aggressive color correction and emissive glow for vibrant colors
              const correctedColor = correctColorFor3D(selectedColor);
              const originalColor = new Color(selectedColor);
              
              // Apply color to existing material while preserving realism
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if ('color' in mat) {
                    // Set the base color
                    mat.color.set(correctedColor);
                    
                    // Add emissive glow to push color through lighting
                    if ('emissive' in mat) {
                      mat.emissive.set(originalColor);
                      if ('emissiveIntensity' in mat) {
                        mat.emissiveIntensity = 0.2; // Subtle glow
                      }
                    }
                    
                    // Boost material properties while keeping realism
                    if ('metalness' in mat) mat.metalness = Math.max(0.1, mat.metalness);
                    if ('roughness' in mat) mat.roughness = Math.min(0.8, mat.roughness);
                  }
                });
              } else if ('color' in child.material) {
                // Set the base color
                child.material.color.set(correctedColor);
                
                // Add emissive glow to push color through lighting
                if ('emissive' in child.material) {
                  child.material.emissive.set(originalColor);
                  if ('emissiveIntensity' in child.material) {
                    child.material.emissiveIntensity = 0.2; // Subtle glow
                  }
                }
                
                // Boost material properties while keeping realism
                if ('metalness' in child.material) child.material.metalness = Math.max(0.1, child.material.metalness);
                if ('roughness' in child.material) child.material.roughness = Math.min(0.8, child.material.roughness);
              }
            } else {
              // Reset to original color and remove emissive glow
              const originalColor = originalColors.current[child.uuid];
              if (originalColor) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if ('color' in mat) {
                      mat.color.set(originalColor);
                      // Reset emissive properties
                      if ('emissive' in mat) {
                        mat.emissive.set(0x000000);
                        if ('emissiveIntensity' in mat) {
                          mat.emissiveIntensity = 0;
                        }
                      }
                    }
                  });
                } else if ('color' in child.material) {
                  child.material.color.set(originalColor);
                  // Reset emissive properties
                  if ('emissive' in child.material) {
                    child.material.emissive.set(0x000000);
                    if ('emissiveIntensity' in child.material) {
                      child.material.emissiveIntensity = 0;
                    }
                  }
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
