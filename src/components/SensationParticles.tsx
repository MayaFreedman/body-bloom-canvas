
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
  const meshRefsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  
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
              mark.position.x + (Math.random() - 0.5) * 0.00195, // Reduced from 0.003 (35% reduction)
              mark.position.y + (Math.random() - 0.5) * 0.00195, // Reduced from 0.003 (35% reduction)
              mark.position.z + (Math.random() - 0.5) * 0.00195  // Reduced from 0.003 (35% reduction)
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.000325, // Reduced from 0.0005 (35% reduction)
              (Math.random() - 0.5) * 0.000325, // Reduced from 0.0005 (35% reduction)
              (Math.random() - 0.5) * 0.000325  // Reduced from 0.0005 (35% reduction)
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
                (Math.random() - 0.5) * 0.00065, // Reduced from 0.001 (35% reduction)
                (Math.random() - 0.5) * 0.00065, // Reduced from 0.001 (35% reduction)
                (Math.random() - 0.5) * 0.00065  // Reduced from 0.001 (35% reduction)
              ),
              rotationSpeed: (Math.random() - 0.5) * 0.4,
              oscillationSpeed: 3 + Math.random() * 6
            });
          } else {
            particles.push(baseParticle);
          }
        }
        
        particleSystemsRef.current.set(mark.id, particles);
        meshRefsRef.current.set(mark.id, []);
      }
      
      systems[mark.id] = particleSystemsRef.current.get(mark.id)!;
    });
    
    // Clean up old systems
    const currentIds = new Set(sensationMarks.map(m => m.id));
    for (const id of particleSystemsRef.current.keys()) {
      if (!currentIds.has(id)) {
        particleSystemsRef.current.delete(id);
        meshRefsRef.current.delete(id);
      }
    }
    
    return systems;
  }, [sensationMarks]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    sensationMarks.forEach((mark) => {
      const particles = particleSystems[mark.id];
      const meshes = meshRefsRef.current.get(mark.id);
      if (!particles || !meshes) return;

      particles.forEach((particle, index) => {
        // Update particle life
        particle.life += delta * 35;
        
        // Update animation properties
        particle.rotation += particle.rotationSpeed * delta * 15;
        particle.oscillationPhase += particle.oscillationSpeed * delta;
        
        // Update electrical properties for nerves
        if (mark.icon === 'Activity' && particle.electricalPulse !== undefined) {
          particle.electricalPulse += delta * 12;
          particle.flickerPhase! += delta * 20;
        }
        
        // Reset particle if it's dead
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          particle.position.copy(mark.position);
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.00325, // Reduced from 0.005 (35% reduction)
            (Math.random() - 0.5) * 0.00325, // Reduced from 0.005 (35% reduction)
            (Math.random() - 0.5) * 0.00325  // Reduced from 0.005 (35% reduction)
          ));
          
          // Reset animation properties
          particle.rotation = Math.random() * Math.PI * 2;
          particle.oscillationPhase = Math.random() * Math.PI * 2;
          
          if (mark.icon === 'Activity') {
            particle.flickerPhase = Math.random() * Math.PI * 2;
            particle.electricalPulse = Math.random() * Math.PI * 2;
            particle.sparkIntensity = Math.random();
            
            // Reset velocity for nerves
            particle.velocity.set(
              (Math.random() - 0.5) * 0.00065, // Reduced from 0.001 (35% reduction)
              (Math.random() - 0.5) * 0.00065, // Reduced from 0.001 (35% reduction)
              (Math.random() - 0.5) * 0.00065  // Reduced from 0.001 (35% reduction)
            );
          } else if (mark.icon === 'butterfly') {
            // Reset butterfly velocity
            particle.velocity.set(
              (Math.random() - 0.5) * 0.00052, // Reduced from 0.0008 (35% reduction)
              (Math.random() - 0.5) * 0.00052, // Reduced from 0.0008 (35% reduction)
              (Math.random() - 0.5) * 0.00052  // Reduced from 0.0008 (35% reduction)
            );
          } else {
            // Default reset
            particle.velocity.set(
              (Math.random() - 0.5) * 0.000325, // Reduced from 0.0005 (35% reduction)
              Math.random() * 0.00065, // Reduced from 0.001 (35% reduction)
              (Math.random() - 0.5) * 0.000325  // Reduced from 0.0005 (35% reduction)
            );
          }
        }
        
        // Update position based on icon type with reduced movement range
        if (mark.icon === 'Activity') {
          // Nerves: electrical sparking with reduced movement range
          const electricalJitter = Math.sin(particle.electricalPulse! * 4) * 0.00026; // Reduced from 0.0004 (35% reduction)
          const sparkJump = Math.sin(time * 25 + particle.life * 0.8) * 0.000195; // Reduced from 0.0003 (35% reduction)
          const rapidOscillation = Math.sin(particle.oscillationPhase * 4) * 0.00026; // Reduced from 0.0004 (35% reduction)
          
          // More frequent sudden direction changes for electrical effect
          if (Math.random() < 0.08) { // 8% chance per frame
            particle.velocity.multiplyScalar(0.2);
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.00052, // Reduced from 0.0008 (35% reduction)
              (Math.random() - 0.5) * 0.00052, // Reduced from 0.0008 (35% reduction)
              (Math.random() - 0.5) * 0.00052  // Reduced from 0.0008 (35% reduction)
            ));
          }
          
          // Apply velocity and electrical effects
          particle.position.add(particle.velocity);
          particle.position.x += electricalJitter + sparkJump + rapidOscillation;
          particle.position.y += electricalJitter * 1.2 + Math.cos(particle.oscillationPhase * 3) * 0.000195; // Reduced from 0.0003 (35% reduction)
          particle.position.z += rapidOscillation + sparkJump * 0.8;
          
          // Less damping for more active movement
          particle.velocity.multiplyScalar(0.95);
        } else if (mark.icon === 'butterfly') {
          // Butterfly: enhanced fluttering with wing-beat simulation
          const wingBeat = Math.sin(time * 15 + particle.life) * 0.000325; // Reduced from 0.0005 (35% reduction)
          const flutter = Math.sin(particle.oscillationPhase * 2) * 0.00026; // Reduced from 0.0004 (35% reduction)
          const drift = Math.cos(time * 3 + particle.life * 0.1) * 0.000195; // Reduced from 0.0003 (35% reduction)
          
          particle.position.add(particle.velocity);
          particle.position.x += wingBeat * (Math.random() - 0.5) + flutter + drift;
          particle.position.y += wingBeat * 0.8 + Math.cos(particle.oscillationPhase * 1.5) * 0.00026; // Reduced from 0.0004 (35% reduction)
          particle.position.z += flutter * 0.6 + drift * 0.5;
        } else {
          // Default: gentle floating
          particle.position.add(particle.velocity);
        }

        // Update the corresponding mesh
        const mesh = meshes[index];
        if (mesh) {
          mesh.position.copy(particle.position);
          mesh.rotation.set(particle.rotation, particle.rotation * 1.3, particle.rotation * 0.8);
          
          // Update scale and opacity based on particle properties
          const opacity = 1 - (particle.life / particle.maxLife);
          
          if (mark.icon === 'Activity') {
            const flickerIntensity = 0.4 + Math.sin(particle.flickerPhase!) * 0.5;
            const pulseScale = 1 + Math.sin(particle.electricalPulse!) * 0.8;
            mesh.scale.setScalar(pulseScale);
            
            // Update material properties for electrical effect
            const material = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (material) {
              material.opacity = Math.max(0.1, opacity * flickerIntensity);
              material.emissiveIntensity = flickerIntensity * 0.4;
            }
          } else if (mark.icon === 'butterfly') {
            const wingScale = 1 + Math.sin(particle.oscillationPhase * 3) * 0.4;
            mesh.scale.setScalar(particle.size * 3.5 * wingScale);
            
            // Update sprite material opacity
            const material = (mesh as any).material;
            if (material) {
              material.opacity = opacity * (0.7 + Math.sin(particle.oscillationPhase * 3) * 0.2);
            }
          }
        }
      });
    });
  });

  const renderParticleSystem = (mark: typeof sensationMarks[0]) => {
    const particles = particleSystems[mark.id];
    if (!particles) return null;

    // Store mesh refs for this mark
    const meshes: THREE.Object3D[] = [];
    meshRefsRef.current.set(mark.id, meshes);

    return particles.map((particle, index) => {
      const opacity = 1 - (particle.life / particle.maxLife);
      
      // Different shapes based on icon type
      if (mark.icon === 'butterfly') {
        return (
          <sprite 
            key={`${mark.id}-${index}`}
            ref={(ref) => { if (ref) meshes[index] = ref; }}
            position={particle.position} 
            scale={[particle.size * 3.5, particle.size * 3.5, 1]}
            rotation={[0, 0, particle.rotation]}
          >
            <spriteMaterial 
              map={butterflyTexture} 
              transparent 
              opacity={opacity * 0.7}
              color={mark.color}
            />
          </sprite>
        );
      } else if (mark.icon === 'Activity') {
        return (
          <mesh 
            key={`${mark.id}-${index}`}
            ref={(ref) => { if (ref) meshes[index] = ref; }}
            position={particle.position}
            rotation={[particle.rotation, particle.rotation * 1.3, particle.rotation * 0.8]}
          >
            <boxGeometry args={[particle.size, particle.size * 2.5, particle.size]} />
            <meshStandardMaterial 
              color={mark.color} 
              transparent 
              opacity={Math.max(0.1, opacity)}
              emissive={mark.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      } else {
        return (
          <mesh 
            key={`${mark.id}-${index}`}
            ref={(ref) => { if (ref) meshes[index] = ref; }}
            position={particle.position}
          >
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
