
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

// Import particle effect textures
import butterflyTexture from '@/Assets/particleEffects/butterfly.png';
import painTexture from '@/Assets/particleEffects/pain.png';
import swirlTexture from '@/Assets/particleEffects/swirl.png';
import waterTexture from '@/Assets/particleEffects/water.png';
import snowflakesTexture from '@/Assets/particleEffects/snowflakes.png';
import fireTexture from '@/Assets/particleEffects/fire.png';
import heartTexture from '@/Assets/particleEffects/heart.png';
import zzzTexture from '@/Assets/particleEffects/zzz.png';
import windTexture from '@/Assets/particleEffects/wind.png';
import starTexture from '@/Assets/particleEffects/star.png';
import shakeTexture from '@/Assets/particleEffects/shake.png';
import feetTexture from '@/Assets/particleEffects/feet.png';
import feetredTexture from '@/Assets/particleEffects/feetred.png';
import nauticalKnotTexture from '@/Assets/particleEffects/nautical-knot.png';
import frogTexture from '@/Assets/particleEffects/frog.png';
import plateTexture from '@/Assets/particleEffects/plate.png';
import stoneTexture from '@/Assets/particleEffects/stone.png';
import fidgetSpinnerTexture from '@/Assets/particleEffects/fidget-spinner.png';
import statueTexture from '@/Assets/particleEffects/statue.png';
import snailTexture from '@/Assets/particleEffects/snail.png';
import desertTexture from '@/Assets/particleEffects/desert.png';
import clenchedFistTexture from '@/Assets/particleEffects/clenched-fist.png';
import lightbulbTexture from '@/Assets/particleEffects/lightbulb.png';
import monkeyTexture from '@/Assets/particleEffects/monkey.png';
import wavyTexture from '@/Assets/particleEffects/wavy.png';
import goosebumpTexture from '@/Assets/particleEffects/goosebump.png';
import relaxTexture from '@/Assets/particleEffects/relax.png';
import sweatTexture from '@/Assets/particleEffects/sweat.png';

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
    name?: string;
  }>;
}

const SensationParticles: React.FC<SensationParticlesProps> = ({ sensationMarks }) => {
  const particleSystemsRef = useRef<Map<string, SensationParticle[]>>(new Map());
  const meshRefsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  
  // Load all particle textures
  const textureMap = useMemo(() => {
    const loader = new TextureLoader();
    return {
      butterfly: loader.load(butterflyTexture),
      pain: loader.load(painTexture),
      swirl: loader.load(swirlTexture),
      water: loader.load(waterTexture),
      snowflakes: loader.load(snowflakesTexture),
      fire: loader.load(fireTexture),
      heart: loader.load(heartTexture),
      zzz: loader.load(zzzTexture),
      wind: loader.load(windTexture),
      star: loader.load(starTexture),
      shake: loader.load(shakeTexture),
      feet: loader.load(feetTexture),
      feetred: loader.load(feetredTexture),
      nauticalKnot: loader.load(nauticalKnotTexture),
      frog: loader.load(frogTexture),
      plate: loader.load(plateTexture),
      stone: loader.load(stoneTexture),
      fidgetSpinner: loader.load(fidgetSpinnerTexture),
      statue: loader.load(statueTexture),
      snail: loader.load(snailTexture),
      desert: loader.load(desertTexture),
      clenchedFist: loader.load(clenchedFistTexture),
      lightbulb: loader.load(lightbulbTexture),
      monkey: loader.load(monkeyTexture),
      wavy: loader.load(wavyTexture),
      goosebump: loader.load(goosebumpTexture),
      relax: loader.load(relaxTexture),
      sweat: loader.load(sweatTexture)
    };
  }, []);

  // Map sensation names to textures
  const getSensationTexture = (sensationName: string) => {
    const textureMapping: { [key: string]: keyof typeof textureMap } = {
      'Nerves': 'butterfly',
      'Pain': 'pain',
      'Nausea': 'swirl',
      'Tears': 'water',
      'Decreased Temperature': 'snowflakes',
      'Increased Temperature': 'fire',
      'Increased Heart Rate': 'heart',
      'Decreased Heart Rate': 'heart',
      'Tired': 'zzz',
      'Change in Breathing': 'wind',
      'Tingling': 'star',
      'Shaky': 'shake',
      'Pacing': 'feet',
      'Stomping': 'feetred',
      'Tight': 'nauticalKnot',
      'Lump in Throat': 'frog',
      'Change in Appetite': 'plate',
      'Heaviness': 'stone',
      'Fidgety': 'fidgetSpinner',
      'Frozen/Stiff': 'statue',
      'Ache': 'pain',
      'Feeling Small': 'snail',
      'Dry Mouth': 'desert',
      'Clenched': 'clenchedFist',
      'Change in Energy': 'lightbulb',
      'Avoiding Eye Contact': 'monkey',
      'Scrunched Face': 'wavy',
      'Goosebumps': 'goosebump',
      'Relaxed': 'relax',
      'Sweat': 'sweat'
    };
    
    const textureKey = textureMapping[sensationName] || 'star';
    return textureMap[textureKey];
  };

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
              mark.position.x + (Math.random() - 0.5) * 0.0015, // Reduced from 0.003 by 50%
              mark.position.y + (Math.random() - 0.5) * 0.0015, // Reduced from 0.003 by 50%
              mark.position.z + (Math.random() - 0.5) * 0.0015  // Reduced from 0.003 by 50%
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.00025, // Reduced from 0.0005 by 50%
              (Math.random() - 0.5) * 0.00025, // Reduced from 0.0005 by 50%
              (Math.random() - 0.5) * 0.00025  // Reduced from 0.0005 by 50%
            ),
            life: Math.random() * 100,
            maxLife: 80 + Math.random() * 40,
            size: (0.015 + Math.random() * 0.025) * 0.9, // Reduced from 1.8 to 0.9 (50% reduction)
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
                (Math.random() - 0.5) * 0.0005, // Reduced from 0.001 by 50%
                (Math.random() - 0.5) * 0.0005, // Reduced from 0.001 by 50%
                (Math.random() - 0.5) * 0.0005  // Reduced from 0.001 by 50%
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
            (Math.random() - 0.5) * 0.0025, // Reduced from 0.005 by 50%
            (Math.random() - 0.5) * 0.0025, // Reduced from 0.005 by 50%
            (Math.random() - 0.5) * 0.0025  // Reduced from 0.005 by 50%
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
              (Math.random() - 0.5) * 0.0005, // Reduced from 0.001 by 50%
              (Math.random() - 0.5) * 0.0005, // Reduced from 0.001 by 50%
              (Math.random() - 0.5) * 0.0005  // Reduced from 0.001 by 50%
            );
          } else if (mark.icon === 'butterfly') {
            // Reset butterfly velocity
            particle.velocity.set(
              (Math.random() - 0.5) * 0.0004, // Reduced from 0.0008 by 50%
              (Math.random() - 0.5) * 0.0004, // Reduced from 0.0008 by 50%
              (Math.random() - 0.5) * 0.0004  // Reduced from 0.0008 by 50%
            );
          } else {
            // Default reset
            particle.velocity.set(
              (Math.random() - 0.5) * 0.00025, // Reduced from 0.0005 by 50%
              Math.random() * 0.0005, // Reduced from 0.001 by 50%
              (Math.random() - 0.5) * 0.00025  // Reduced from 0.0005 by 50%
            );
          }
        }
        
        // Update position based on icon type with reduced movement range
        if (mark.icon === 'Activity') {
          // Nerves: electrical sparking with reduced movement range
          const electricalJitter = Math.sin(particle.electricalPulse! * 4) * 0.0002; // Reduced from 0.0004 by 50%
          const sparkJump = Math.sin(time * 25 + particle.life * 0.8) * 0.00015; // Reduced from 0.0003 by 50%
          const rapidOscillation = Math.sin(particle.oscillationPhase * 4) * 0.0002; // Reduced from 0.0004 by 50%
          
          // More frequent sudden direction changes for electrical effect
          if (Math.random() < 0.08) { // 8% chance per frame
            particle.velocity.multiplyScalar(0.2);
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.0004, // Reduced from 0.0008 by 50%
              (Math.random() - 0.5) * 0.0004, // Reduced from 0.0008 by 50%
              (Math.random() - 0.5) * 0.0004  // Reduced from 0.0008 by 50%
            ));
          }
          
          // Apply velocity and electrical effects
          particle.position.add(particle.velocity);
          particle.position.x += electricalJitter + sparkJump + rapidOscillation;
          particle.position.y += electricalJitter * 1.2 + Math.cos(particle.oscillationPhase * 3) * 0.00015; // Reduced from 0.0003 by 50%
          particle.position.z += rapidOscillation + sparkJump * 0.8;
          
          // Less damping for more active movement
          particle.velocity.multiplyScalar(0.95);
        } else if (mark.icon === 'butterfly') {
          // Butterfly: enhanced fluttering with wing-beat simulation
          const wingBeat = Math.sin(time * 15 + particle.life) * 0.00025; // Reduced from 0.0005 by 50%
          const flutter = Math.sin(particle.oscillationPhase * 2) * 0.0002; // Reduced from 0.0004 by 50%
          const drift = Math.cos(time * 3 + particle.life * 0.1) * 0.00015; // Reduced from 0.0003 by 50%
          
          particle.position.add(particle.velocity);
          particle.position.x += wingBeat * (Math.random() - 0.5) + flutter + drift;
          particle.position.y += wingBeat * 0.8 + Math.cos(particle.oscillationPhase * 1.5) * 0.0002; // Reduced from 0.0004 by 50%
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
            mesh.scale.setScalar(particle.size * 1.75 * wingScale); // Reduced from 3.5 to 1.75 (50% reduction)
            
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

    // Get the appropriate texture for this sensation mark
    const sensationTexture = getSensationTexture(mark.name || mark.icon);

    return particles.map((particle, index) => {
      const opacity = 1 - (particle.life / particle.maxLife);
      
      // Use sprites for all sensation types with their appropriate textures
      return (
        <sprite 
          key={`${mark.id}-${index}`}
          ref={(ref) => { if (ref) meshes[index] = ref; }}
          position={particle.position} 
          scale={[particle.size * 1.5, particle.size * 1.5, 1]}
          rotation={[0, 0, particle.rotation]}
        >
          <spriteMaterial 
            map={sensationTexture} 
            transparent 
            opacity={opacity * 0.8}
          />
        </sprite>
      );
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
