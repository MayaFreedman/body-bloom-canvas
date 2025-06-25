
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
  sparkIntensity?: number;
  flickerPhase?: number;
  electricalPulse?: number;
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
          const baseParticle = {
            position: new THREE.Vector3(
              mark.position.x + (Math.random() - 0.5) * 0.4,
              mark.position.y + (Math.random() - 0.5) * 0.4,
              mark.position.z + (Math.random() - 0.5) * 0.4
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            ),
            life: Math.random() * 100,
            maxLife: 80 + Math.random() * 40,
            size: (0.015 + Math.random() * 0.025) * 1.8,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            oscillationPhase: Math.random() * Math.PI * 2,
            oscillationSpeed: 0.8 + Math.random() * 2.2
          };

          // Add special properties for nerves/electrical particles
          if (mark.icon === 'Activity') {
            particles.push({
              ...baseParticle,
              sparkIntensity: Math.random(),
              flickerPhase: Math.random() * Math.PI * 2,
              electricalPulse: Math.random() * Math.PI * 2,
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.04,
                (Math.random() - 0.5) * 0.04,
                (Math.random() - 0.5) * 0.04
              ),
              rotationSpeed: (Math.random() - 0.5) * 0.25,
              oscillationSpeed: 2 + Math.random() * 4
            });
          } else {
            particles.push(baseParticle);
          }
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
    const time = state.clock.elapsedTime;

    sensationMarks.forEach((mark) => {
      const particles = particleSystems[mark.id];
      if (!particles) return;

      particles.forEach((particle) => {
        // Update particle life
        particle.life += delta * 35;
        
        // Update animation properties
        particle.rotation += particle.rotationSpeed * delta * 12;
        particle.oscillationPhase += particle.oscillationSpeed * delta;
        
        // Update electrical properties for nerves
        if (mark.icon === 'Activity' && particle.electricalPulse !== undefined) {
          particle.electricalPulse += delta * 8;
          particle.flickerPhase! += delta * 15;
        }
        
        // Reset particle if it's dead
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.position.copy(mark.position);
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
          ));
          
          // Reset animation properties
          particle.rotation = Math.random() * Math.PI * 2;
          particle.oscillationPhase = Math.random() * Math.PI * 2;
          
          if (mark.icon === 'Activity') {
            particle.flickerPhase = Math.random() * Math.PI * 2;
            particle.electricalPulse = Math.random() * Math.PI * 2;
            particle.sparkIntensity = Math.random();
          }
          
          // Different movement patterns based on icon type
          if (mark.icon === 'butterfly' || mark.icon === 'Activity') {
            // More erratic movement
            particle.velocity.set(
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05
            );
            particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
          } else {
            // Default: gentle floating
            particle.velocity.set(
              (Math.random() - 0.5) * 0.01,
              Math.random() * 0.02,
              (Math.random() - 0.5) * 0.01
            );
          }
        }
        
        // Update position based on icon type
        if (mark.icon === 'Activity') {
          // Nerves: electrical sparking with rapid direction changes
          const electricalJitter = Math.sin(particle.electricalPulse! * 3) * 0.015;
          const sparkJump = Math.sin(time * 20 + particle.life * 0.5) * 0.008;
          const rapidOscillation = Math.sin(particle.oscillationPhase * 3) * 0.012;
          
          // Add sudden direction changes to simulate electrical impulses
          if (Math.random() < 0.05) { // 5% chance per frame for direction change
            particle.velocity.multiplyScalar(0.3);
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03
            ));
          }
          
          particle.position.add(particle.velocity);
          particle.position.x += electricalJitter + sparkJump + rapidOscillation;
          particle.position.y += electricalJitter * 0.8 + Math.cos(particle.oscillationPhase * 2) * 0.01;
          particle.position.z += rapidOscillation * 0.6 + sparkJump;
          
          // Damping to prevent particles from flying away
          particle.velocity.multiplyScalar(0.98);
          
        } else if (mark.icon === 'butterfly') {
          // Butterfly: add jitter to simulate fluttering
          const jitter = Math.sin(time * 12 + particle.life) * 0.01;
          const oscillation = Math.sin(particle.oscillationPhase) * 0.012;
          
          particle.position.add(particle.velocity);
          particle.position.x += jitter * (Math.random() - 0.5) + oscillation;
          particle.position.y += jitter * (Math.random() - 0.5) + Math.cos(particle.oscillationPhase) * 0.01;
          particle.position.z += oscillation * 0.5;
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
        // Butterfly: use butterfly texture on sprite with animation
        const scale = particle.size * 3.5 * (1 + Math.sin(particle.oscillationPhase * 2) * 0.3);
        const animatedOpacity = opacity * (0.7 + Math.sin(particle.oscillationPhase * 3) * 0.2);
        
        return (
          <sprite 
            key={`${mark.id}-${index}`} 
            position={particle.position} 
            scale={[scale, scale, 1]}
            rotation={[0, 0, particle.rotation]}
          >
            <spriteMaterial 
              map={butterflyTexture} 
              transparent 
              opacity={animatedOpacity}
              color={mark.color}
            />
          </sprite>
        );
      } else if (mark.icon === 'Activity') {
        // Nerves: electrical sparks with flickering and pulsing
        const flickerIntensity = 0.5 + Math.sin(particle.flickerPhase!) * 0.4;
        const pulseScale = 1 + Math.sin(particle.electricalPulse!) * 0.6;
        const electricalOpacity = opacity * flickerIntensity * (0.8 + Math.sin(particle.electricalPulse! * 2) * 0.2);
        
        return (
          <mesh 
            key={`${mark.id}-${index}`} 
            position={particle.position}
            rotation={[particle.rotation, particle.rotation * 1.3, particle.rotation * 0.8]}
            scale={[pulseScale, pulseScale, pulseScale]}
          >
            <boxGeometry args={[particle.size * 0.8, particle.size * 2, particle.size * 0.8]} />
            <meshStandardMaterial 
              color={mark.color} 
              transparent 
              opacity={Math.max(0.1, electricalOpacity)}
              emissive={mark.color}
              emissiveIntensity={flickerIntensity * 0.3}
            />
          </mesh>
        );
      } else {
        // Default: spheres
        return (
          <mesh key={`${mark.id}-${index}`} position={particle.position}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshBasicMaterial 
              color={mark.color} 
              transparent 
              opacity={opacity * 0.7}
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
