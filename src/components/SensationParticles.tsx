
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
        
        // Create particles based on icon type - increased particle count for butterfly/nerves
        const particleCount = (mark.icon === 'butterfly' || mark.icon === 'Activity') ? 12 : 8;
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            position: new THREE.Vector3(
              mark.position.x + (Math.random() - 0.5) * 0.3, // 50% larger spread
              mark.position.y + (Math.random() - 0.5) * 0.3,
              mark.position.z + (Math.random() - 0.5) * 0.3
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.015, // 50% larger velocity
              (Math.random() - 0.5) * 0.015,
              (Math.random() - 0.5) * 0.015
            ),
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50,
            size: (0.02 + Math.random() * 0.03) * 1.5 // 50% larger size
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
            (Math.random() - 0.5) * 0.15, // 50% larger reset area
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
          ));
          
          // Different movement patterns based on icon type
          if (mark.icon === 'butterfly' || mark.icon === 'Activity') {
            // Butterfly/Nerves: erratic, jittery movement
            particle.velocity.set(
              (Math.random() - 0.5) * 0.03, // 50% larger velocity
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03
            );
          } else {
            // Default: gentle floating
            particle.velocity.set(
              (Math.random() - 0.5) * 0.0075, // 50% larger velocity
              Math.random() * 0.015,
              (Math.random() - 0.5) * 0.0075
            );
          }
        }
        
        // Update position based on icon type
        if (mark.icon === 'butterfly' || mark.icon === 'Activity') {
          // Butterfly/Nerves: add jitter to simulate fluttering/electrical activity
          const jitter = Math.sin(state.clock.elapsedTime * 10 + particle.life) * 0.0075; // 50% larger jitter
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
      if (mark.icon === 'butterfly') {
        // Butterfly: small cubes to represent fluttering motion
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
      } else if (mark.icon === 'Activity') {
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
