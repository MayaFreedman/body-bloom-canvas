
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface SensationParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  oscillationPhase: number;
  oscillationSpeed: number;
  initialPosition: THREE.Vector3;
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
  
  // Load butterfly texture
  const butterflyTexture = useLoader(TextureLoader, '/lovable-uploads/b0a2add0-f14a-40a7-add9-b5efdb14a891.png');

  // Create particle system for each sensation mark
  const particleSystems = useMemo(() => {
    const systems: { [key: string]: SensationParticle[] } = {};
    
    sensationMarks.forEach((mark) => {
      if (!particleSystemsRef.current.has(mark.id)) {
        const particles: SensationParticle[] = [];
        
        // Create particles based on icon type - increased particle count for butterfly/nerves
        const particleCount = (mark.icon === 'butterfly' || mark.icon === 'Activity') ? 15 : 8;
        
        for (let i = 0; i < particleCount; i++) {
          const initialPos = new THREE.Vector3(
            mark.position.x + (Math.random() - 0.5) * 0.1,
            mark.position.y + (Math.random() - 0.5) * 0.1,
            mark.position.z + (Math.random() - 0.5) * 0.1
          );
          
          particles.push({
            position: initialPos.clone(),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            ),
            life: Math.random() * 100,
            maxLife: 80 + Math.random() * 40,
            size: (0.03 + Math.random() * 0.04) * 1.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            oscillationPhase: Math.random() * Math.PI * 2,
            oscillationSpeed: 1 + Math.random() * 2,
            initialPosition: initialPos.clone()
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
        particle.life += delta * 25;
        
        // Update animation properties
        particle.rotation += particle.rotationSpeed * delta * 8;
        particle.oscillationPhase += particle.oscillationSpeed * delta * 2;
        
        // Reset particle if it's dead
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.position.copy(particle.initialPosition);
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ));
          
          // Reset animation properties with variation
          particle.rotation = Math.random() * Math.PI * 2;
          particle.rotationSpeed = (Math.random() - 0.5) * 0.15;
          particle.oscillationPhase = Math.random() * Math.PI * 2;
          particle.oscillationSpeed = 1 + Math.random() * 2;
          
          // Different movement patterns based on icon type
          if (mark.icon === 'butterfly' || mark.icon === 'Activity') {
            // Butterfly/Nerves: more erratic, flutter-like movement
            particle.velocity.set(
              (Math.random() - 0.5) * 0.04,
              (Math.random() - 0.5) * 0.04,
              (Math.random() - 0.5) * 0.04
            );
          } else {
            // Default: gentle floating
            particle.velocity.set(
              (Math.random() - 0.5) * 0.01,
              Math.random() * 0.02,
              (Math.random() - 0.5) * 0.01
            );
          }
        }
        
        // Update position based on icon type with enhanced animation
        if (mark.icon === 'butterfly' || mark.icon === 'Activity') {
          // Enhanced butterfly/nerves animation with more complex movement
          const time = state.clock.elapsedTime;
          const flutter = Math.sin(time * 8 + particle.life * 0.1) * 0.015;
          const wingBeat = Math.sin(time * 12 + particle.oscillationPhase) * 0.008;
          const spiral = Math.sin(particle.oscillationPhase * 0.5) * 0.02;
          
          // Apply velocity with flutter effect
          particle.position.add(particle.velocity);
          
          // Add complex fluttering motion
          particle.position.x += flutter * Math.cos(time * 3 + particle.oscillationPhase);
          particle.position.y += wingBeat + spiral * Math.sin(time * 2);
          particle.position.z += flutter * Math.sin(time * 4 + particle.oscillationPhase) * 0.5;
          
          // Add some randomness for erratic movement
          if (Math.random() < 0.1) {
            particle.position.x += (Math.random() - 0.5) * 0.01;
            particle.position.y += (Math.random() - 0.5) * 0.01;
            particle.position.z += (Math.random() - 0.5) * 0.005;
          }
        } else {
          particle.position.add(particle.velocity);
        }
        
        // Add some gravity/drift for more realistic movement
        particle.velocity.y += (Math.random() - 0.5) * 0.0005;
        particle.velocity.multiplyScalar(0.98); // slight air resistance
      });
    });
  });

  const renderParticleSystem = (mark: typeof sensationMarks[0]) => {
    const particles = particleSystems[mark.id];
    if (!particles) return null;

    return particles.map((particle, index) => {
      const lifeProgress = particle.life / particle.maxLife;
      const opacity = Math.sin(lifeProgress * Math.PI) * 0.8; // Fade in and out smoothly
      
      // Different shapes based on icon type
      if (mark.icon === 'butterfly') {
        // Enhanced butterfly animation with wing-beat scaling
        const wingBeat = Math.sin(particle.oscillationPhase * 4) * 0.3 + 1;
        const scale = particle.size * 4 * wingBeat * (1 - lifeProgress * 0.3);
        const flickerOpacity = opacity * (0.7 + Math.sin(particle.oscillationPhase * 6) * 0.3);
        
        return (
          <sprite 
            key={`${mark.id}-${index}`} 
            position={particle.position} 
            scale={[scale, scale * 0.8, 1]}
            rotation={[0, 0, particle.rotation + Math.sin(particle.oscillationPhase * 2) * 0.2]}
          >
            <spriteMaterial 
              map={butterflyTexture} 
              transparent 
              opacity={Math.max(0, flickerOpacity)}
              color={mark.color}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        );
      } else if (mark.icon === 'Activity') {
        // Enhanced nerves: electrical spark-like cubes with more dynamic animation
        const spark = Math.sin(particle.oscillationPhase * 8) * 0.5 + 1;
        const scale = particle.size * spark * (1 - lifeProgress * 0.2);
        const electricOpacity = opacity * (0.6 + Math.sin(particle.oscillationPhase * 10) * 0.4);
        
        return (
          <mesh 
            key={`${mark.id}-${index}`} 
            position={particle.position}
            rotation={[
              particle.rotation + Math.sin(particle.oscillationPhase * 3) * 0.5,
              particle.rotation * 0.7 + Math.cos(particle.oscillationPhase * 4) * 0.3,
              particle.rotation * 0.5 + Math.sin(particle.oscillationPhase * 5) * 0.2
            ]}
            scale={[scale, scale * 0.5, scale]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial 
              color={mark.color} 
              transparent 
              opacity={Math.max(0, electricOpacity)}
              emissive={mark.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      } else {
        // Default: enhanced spheres with pulsing
        const pulse = Math.sin(particle.oscillationPhase * 3) * 0.2 + 1;
        const scale = particle.size * pulse;
        
        return (
          <mesh key={`${mark.id}-${index}`} position={particle.position} scale={[scale, scale, scale]}>
            <sphereGeometry args={[1, 8, 8]} />
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
