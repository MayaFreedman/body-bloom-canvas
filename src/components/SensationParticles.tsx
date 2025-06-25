
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SensationParticle {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

interface SensationParticlesProps {
  sensationMarks: Array<{
    id: string;
    position: THREE.Vector3;
    icon: string;
    color: string;
    size: number;
  }>;
}

// Icon shapes as simple geometries
const getIconGeometry = (icon: string) => {
  switch (icon) {
    case 'Activity':
      return new THREE.RingGeometry(0.02, 0.04, 8);
    case 'Zap':
      return new THREE.ConeGeometry(0.03, 0.08, 4);
    case 'Wind':
      return new THREE.RingGeometry(0.01, 0.05, 6);
    case 'Droplet':
      return new THREE.SphereGeometry(0.03, 8, 8);
    case 'Snowflake':
      return new THREE.OctahedronGeometry(0.03);
    case 'Thermometer':
      return new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8);
    case 'Heart':
      return new THREE.SphereGeometry(0.03, 8, 8);
    case 'Star':
      return new THREE.OctahedronGeometry(0.04);
    case 'Sparkles':
      return new THREE.TetrahedronGeometry(0.03);
    default:
      return new THREE.SphereGeometry(0.03, 8, 8);
  }
};

export const SensationParticles: React.FC<SensationParticlesProps> = ({ sensationMarks }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate particles for each sensation mark
  const particles = useMemo(() => {
    const allParticles: SensationParticle[] = [];
    
    sensationMarks.forEach((mark) => {
      // Create multiple particles per sensation mark
      for (let i = 0; i < 15; i++) {
        const particle: SensationParticle = {
          id: `${mark.id}-particle-${i}`,
          position: mark.position.clone().add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            )
          ),
          icon: mark.icon,
          color: mark.color,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            Math.random() * 0.02,
            (Math.random() - 0.5) * 0.01
          ),
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 100,
          size: 0.02 + Math.random() * 0.03
        };
        allParticles.push(particle);
      }
    });
    
    return allParticles;
  }, [sensationMarks]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Update particle positions and life
    particles.forEach((particle, index) => {
      particle.life += delta * 30;
      
      // Reset particle if it exceeds max life
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        // Find the original sensation mark position
        const originalMark = sensationMarks.find(mark => particle.id.startsWith(mark.id));
        if (originalMark) {
          particle.position.copy(originalMark.position).add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            )
          );
        }
      } else {
        // Update position based on velocity
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      }

      // Update the mesh position if it exists
      const mesh = groupRef.current?.children[index] as THREE.Mesh;
      if (mesh) {
        mesh.position.copy(particle.position);
        
        // Fade out particles as they age
        const alpha = 1 - (particle.life / particle.maxLife);
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = alpha * 0.8;
        }
        
        // Add slight floating animation
        mesh.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.005;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => {
        const geometry = getIconGeometry(particle.icon);
        
        return (
          <mesh key={particle.id} position={particle.position}>
            <primitive object={geometry} />
            <meshBasicMaterial 
              color={particle.color} 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};
