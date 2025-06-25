
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SensationParticle {
  position: THREE.Vector3;
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

const SensationParticles: React.FC<SensationParticlesProps> = ({ sensationMarks }) => {
  const particleSystemsRef = useRef<Map<string, SensationParticle[]>>(new Map());

  // Create particle system for each sensation mark
  const particleSystems = useMemo(() => {
    const systems: { [key: string]: SensationParticle[] } = {};
    
    sensationMarks.forEach((mark) => {
      if (!particleSystemsRef.current.has(mark.id)) {
        const particles: SensationParticle[] = [];
        
        // Create particles based on icon type
        const particleCount = mark.icon === 'Activity' ? 12 : 8; // More particles for nerves
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: new THREE.Vector3(
              mark.position.x + (Math.random() - 0.5) * 0.2,
              mark.position.y + (Math.random() - 0.5) * 0.2,
              mark.position.z + (Math.random() - 0.5) * 0.2
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01
            ),
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50,
            size: 0.02 + Math.random() * 0.03
          });
        }
        
        particleSystemsRef.current.set(mark.id, particles);
      }
      
      systems[mark.id] = particleSystemsRef.current.get(mark.id)!;
    });
    
    // Clean up old systems
    const currentIds = new Set(sensationMarks.map(m => m.id));
    for (const id of particleSystemsRef.current.keys()) {
      if (!currentIds.has(id)) {
        particleSystemsRef.current.delete(id);
      }
    }
    
    return systems;
  }, [sensationMarks]);

  useFrame((state, delta) => {
    sensationMarks.forEach((mark) => {
      const particles = particleSystems[mark.id];
      if (!particles) return;

      particles.forEach((particle) => {
        // Update particle life
        particle.life += delta * 30;
        
        // Reset particle if it's dead
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.position.copy(mark.position);
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ));
          
          // Different movement patterns based on icon type
          if (mark.icon === 'Activity') {
            // Nerves: erratic, jittery movement
            particle.velocity.set(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            );
          } else {
            // Default: gentle floating
            particle.velocity.set(
              (Math.random() - 0.5) * 0.005,
              Math.random() * 0.01,
              (Math.random() - 0.5) * 0.005
            );
          }
        }
        
        // Update position based on icon type
        if (mark.icon === 'Activity') {
          // Nerves: add jitter to simulate electrical activity
          const jitter = Math.sin(state.clock.elapsedTime * 10 + particle.life) * 0.005;
          particle.position.add(particle.velocity);
          particle.position.x += jitter * (Math.random() - 0.5);
          particle.position.y += jitter * (Math.random() - 0.5);
        } else {
          particle.position.add(particle.velocity);
        }
      });
    });
  });

  const renderParticleSystem = (mark: typeof sensationMarks[0]) => {
    const particles = particleSystems[mark.id];
    if (!particles) return null;

    return particles.map((particle, index) => {
      const opacity = 1 - (particle.life / particle.maxLife);
      
      // Different shapes based on icon type
      if (mark.icon === 'Activity') {
        // Nerves: small cubes to represent electrical signals
        return (
          <mesh key={`${mark.id}-${index}`} position={particle.position}>
            <boxGeometry args={[particle.size, particle.size, particle.size]} />
            <meshBasicMaterial 
              color={mark.color} 
              transparent 
              opacity={opacity * 0.8}
            />
          </mesh>
        );
      } else {
        // Default: spheres
        return (
          <mesh key={`${mark.id}-${index}`} position={particle.position}>
            <sphereGeometry args={[particle.size, 6, 6]} />
            <meshBasicMaterial 
              color={mark.color} 
              transparent 
              opacity={opacity * 0.6}
            />
          </mesh>
        );
      }
    });
  };

  return (
    <group>
      {sensationMarks.map((mark) => (
        <group key={mark.id}>
          {renderParticleSystem(mark)}
        </group>
      ))}
    </group>
  );
};

export default SensationParticles;
