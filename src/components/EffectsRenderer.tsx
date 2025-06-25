
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointsMaterial } from 'three';
import * as THREE from 'three';

interface Effect {
  id: string;
  type: 'sparkle' | 'pulse' | 'flow';
  x: number;
  y: number;
  color: string;
  intensity: number;
}

interface EffectsRendererProps {
  effects: Effect[];
}

export const EffectsRenderer: React.FC<EffectsRendererProps> = ({ effects }) => {
  const sparkleRef = useRef<Points>(null);
  const pulseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Animate sparkles
    if (sparkleRef.current) {
      sparkleRef.current.rotation.z += 0.01;
    }
    
    // Animate pulses
    if (pulseRef.current) {
      pulseRef.current.children.forEach((child, index) => {
        const scale = Math.sin(state.clock.elapsedTime * 2 + index) * 0.5 + 1;
        child.scale.setScalar(scale);
      });
    }
  });

  // Create sparkle particles
  const sparkleEffects = effects.filter(e => e.type === 'sparkle');
  const sparklePositions = new Float32Array(sparkleEffects.length * 30 * 3); // 30 particles per effect
  
  sparkleEffects.forEach((effect, effectIndex) => {
    for (let i = 0; i < 30; i++) {
      const baseIndex = (effectIndex * 30 + i) * 3;
      // Convert 2D screen coordinates to 3D world coordinates (simplified)
      const worldX = (effect.x / 300 - 1) * 2;
      const worldY = -(effect.y / 300 - 1) * 2;
      
      sparklePositions[baseIndex] = worldX + (Math.random() - 0.5) * effect.intensity;
      sparklePositions[baseIndex + 1] = worldY + (Math.random() - 0.5) * effect.intensity;
      sparklePositions[baseIndex + 2] = (Math.random() - 0.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Sparkle Effects */}
      {sparkleEffects.length > 0 && (
        <points ref={sparkleRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparklePositions.length / 3}
              array={sparklePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#ffff00" transparent opacity={0.8} />
        </points>
      )}
      
      {/* Pulse Effects */}
      <group ref={pulseRef}>
        {effects.filter(e => e.type === 'pulse').map((effect) => {
          const worldX = (effect.x / 300 - 1) * 2;
          const worldY = -(effect.y / 300 - 1) * 2;
          
          return (
            <mesh key={effect.id} position={[worldX, worldY, 0]}>
              <ringGeometry args={[0.1, 0.2, 16]} />
              <meshBasicMaterial color={effect.color} transparent opacity={0.6} />
            </mesh>
          );
        })}
      </group>
      
      {/* Flow Effects */}
      {effects.filter(e => e.type === 'flow').map((effect) => {
        const worldX = (effect.x / 300 - 1) * 2;
        const worldY = -(effect.y / 300 - 1) * 2;
        
        return (
          <mesh key={effect.id} position={[worldX, worldY, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={effect.color} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};
