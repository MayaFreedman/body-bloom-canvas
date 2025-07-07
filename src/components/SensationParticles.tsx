
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
  console.log('🦋 SensationParticles - Received sensation marks:', sensationMarks);
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
    console.log('🦋 SensationParticles - Getting texture for sensation:', sensationName);
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

  // Get normalized scale for different textures
  const getNormalizedScale = (sensationName: string) => {
    const scaleMapping: { [key: string]: number } = {
      'Nerves': 1.2,
      'Pain': 0.8,
      'Nausea': 1.0,
      'Tears': 0.6,
      'Decreased Temperature': 1.0,
      'Increased Temperature': 0.9,
      'Increased Heart Rate': 0.8,
      'Decreased Heart Rate': 0.8,
      'Tired': 1.1,
      'Change in Breathing': 0.4, // Reduced from 1.0 - wind image is small
      'Tingling': 0.7,
      'Shaky': 0.3, // Reduced from 1.0 - shake image is small  
      'Pacing': 1.2,
      'Stomping': 0.4, // Reduced from 1.2 - feetred image is small
      'Tight': 1.0,
      'Lump in Throat': 1.0,
      'Change in Appetite': 0.3, // Reduced from 1.0 - plate image is small
      'Heaviness': 0.9,
      'Fidgety': 0.3, // Reduced from 1.0 - fidget spinner image is small
      'Frozen/Stiff': 1.1,
      'Ache': 0.8,
      'Feeling Small': 0.9,
      'Dry Mouth': 1.0,
      'Clenched': 0.3, // Reduced from 0.9 - clenched fist image is small
      'Change in Energy': 0.9,
      'Avoiding Eye Contact': 0.4, // Reduced from 1.0 - monkey image is small
      'Scrunched Face': 0.4, // Reduced from 1.0 - wavy image is small
      'Goosebumps': 1.0,
      'Relaxed': 1.0,
      'Sweat': 0.8
    };
    
    return scaleMapping[sensationName] || 1.0;
  };

  // Create particle system for each sensation mark
  const particleSystems = useMemo(() => {
    console.log('🦋 SensationParticles - Creating particle systems for marks:', sensationMarks);
    const systems: { [key: string]: SensationParticle[] } = {};
    
    sensationMarks.forEach((mark) => {
      console.log('🦋 SensationParticles - Processing mark:', mark.id, 'name:', mark.name, 'icon:', mark.icon);
      if (!particleSystemsRef.current.has(mark.id)) {
        const particles: SensationParticle[] = [];
        
        // Create particles based on effect type with varied density
        const getParticleCount = (sensationName: string) => {
          const densityMapping: { [key: string]: number } = {
            'Nerves': 25,
            'Pain': 12,
            'Nausea': 18,
            'Tears': 8,
            'Tingling': 20,
            'Shaky': 30,
            'Change in Breathing': 15,
            'Increased Heart Rate': 10,
            'Change in Energy': 25,
            'Sweat': 15
          };
          return densityMapping[sensationName] || 12;
        };
        
        const particleCount = getParticleCount(mark.name || mark.icon);
        
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
            size: (0.08 + Math.random() * 0.12) * 2.5, // Significantly increased base size
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
        
        // Get animation intensity and speed for this sensation
        const getAnimationProfile = (sensationName: string) => {
          const profiles: { [key: string]: { speed: number; intensity: number; pattern: string } } = {
            'Nerves': { speed: 2.0, intensity: 1.5, pattern: 'electrical' },
            'Pain': { speed: 0.5, intensity: 0.8, pattern: 'throb' },
            'Nausea': { speed: 1.2, intensity: 1.0, pattern: 'swirl' },
            'Tears': { speed: 0.3, intensity: 0.6, pattern: 'drop' },
            'Tingling': { speed: 1.8, intensity: 1.2, pattern: 'sparkle' },
            'Shaky': { speed: 3.0, intensity: 2.0, pattern: 'shake' },
            'Change in Breathing': { speed: 0.8, intensity: 0.7, pattern: 'wave' },
            'Increased Heart Rate': { speed: 2.5, intensity: 1.3, pattern: 'pulse' },
            'Change in Energy': { speed: 1.5, intensity: 1.0, pattern: 'burst' },
            'Sweat': { speed: 0.4, intensity: 0.5, pattern: 'drip' }
          };
          return profiles[sensationName] || { speed: 1.0, intensity: 1.0, pattern: 'default' };
        };
        
        const animProfile = getAnimationProfile(mark.name || mark.icon);

        // Update position based on animation profile
        if (animProfile.pattern === 'electrical' || mark.icon === 'Activity') {
          // Nerves: electrical sparking
          const electricalJitter = Math.sin(particle.electricalPulse! * 4 * animProfile.speed) * 0.0004 * animProfile.intensity;
          const sparkJump = Math.sin(time * 25 * animProfile.speed + particle.life * 0.8) * 0.0003 * animProfile.intensity;
          const rapidOscillation = Math.sin(particle.oscillationPhase * 4 * animProfile.speed) * 0.0004 * animProfile.intensity;
          
          if (Math.random() < 0.08 * animProfile.speed) {
            particle.velocity.multiplyScalar(0.2);
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.0008 * animProfile.intensity,
              (Math.random() - 0.5) * 0.0008 * animProfile.intensity,
              (Math.random() - 0.5) * 0.0008 * animProfile.intensity
            ));
          }
          
          particle.position.add(particle.velocity);
          particle.position.x += electricalJitter + sparkJump + rapidOscillation;
          particle.position.y += electricalJitter * 1.2 + Math.cos(particle.oscillationPhase * 3) * 0.0003 * animProfile.intensity;
          particle.position.z += rapidOscillation + sparkJump * 0.8;
          particle.velocity.multiplyScalar(0.95);
          
        } else if (animProfile.pattern === 'shake') {
          // Shaky: rapid trembling
          const shakeX = Math.sin(time * 50 * animProfile.speed) * 0.0008 * animProfile.intensity;
          const shakeY = Math.cos(time * 47 * animProfile.speed) * 0.0008 * animProfile.intensity;
          const shakeZ = Math.sin(time * 53 * animProfile.speed) * 0.0006 * animProfile.intensity;
          
          particle.position.add(particle.velocity);
          particle.position.x += shakeX;
          particle.position.y += shakeY;
          particle.position.z += shakeZ;
          
        } else if (animProfile.pattern === 'pulse') {
          // Heart rate: pulsing movement
          const pulse = Math.sin(time * 12 * animProfile.speed) * 0.0005 * animProfile.intensity;
          const beatPattern = Math.sin(time * 24 * animProfile.speed) * 0.0003 * animProfile.intensity;
          
          particle.position.add(particle.velocity);
          particle.position.y += pulse + beatPattern;
          particle.position.x += beatPattern * 0.5;
          
        } else if (animProfile.pattern === 'swirl') {
          // Nausea: swirling motion
          const swirl = Math.sin(particle.oscillationPhase * animProfile.speed) * 0.0006 * animProfile.intensity;
          const spiral = Math.cos(particle.oscillationPhase * animProfile.speed * 0.8) * 0.0004 * animProfile.intensity;
          
          particle.position.add(particle.velocity);
          particle.position.x += swirl;
          particle.position.z += spiral;
          
        } else if (mark.icon === 'butterfly') {
          // Butterfly: enhanced fluttering
          const wingBeat = Math.sin(time * 15 * animProfile.speed + particle.life) * 0.0005 * animProfile.intensity;
          const flutter = Math.sin(particle.oscillationPhase * 2) * 0.0004 * animProfile.intensity;
          const drift = Math.cos(time * 3 + particle.life * 0.1) * 0.0003 * animProfile.intensity;
          
          particle.position.add(particle.velocity);
          particle.position.x += wingBeat * (Math.random() - 0.5) + flutter + drift;
          particle.position.y += wingBeat * 0.8 + Math.cos(particle.oscillationPhase * 1.5) * 0.0004 * animProfile.intensity;
          particle.position.z += flutter * 0.6 + drift * 0.5;
          
        } else {
          // Default: gentle floating with profile adjustments
          const gentleFloat = Math.sin(particle.oscillationPhase * animProfile.speed) * 0.0002 * animProfile.intensity;
          particle.position.add(particle.velocity);
          particle.position.y += gentleFloat;
        }

        // Update the corresponding mesh
        const mesh = meshes[index];
        if (mesh) {
          mesh.position.copy(particle.position);
          mesh.rotation.set(particle.rotation, particle.rotation * 1.3, particle.rotation * 0.8);
          
          // Update scale and opacity based on particle properties
          const opacity = 1 - (particle.life / particle.maxLife);
          const normalizedScale = getNormalizedScale(mark.name || mark.icon);
          
          if (mark.icon === 'Activity') {
            const flickerIntensity = 0.4 + Math.sin(particle.flickerPhase!) * 0.5;
            const pulseScale = 1 + Math.sin(particle.electricalPulse!) * 0.8;
            mesh.scale.setScalar(particle.size * normalizedScale * pulseScale);
            
            // Update material properties for electrical effect
            const material = (mesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (material) {
              material.opacity = Math.max(0.1, opacity * flickerIntensity);
              material.emissiveIntensity = flickerIntensity * 0.4;
            }
          } else if (mark.icon === 'butterfly') {
            const wingScale = 1 + Math.sin(particle.oscillationPhase * 3) * 0.4;
            mesh.scale.setScalar(particle.size * normalizedScale * wingScale);
            
            // Update sprite material opacity
            const material = (mesh as any).material;
            if (material) {
              material.opacity = opacity * (0.7 + Math.sin(particle.oscillationPhase * 3) * 0.2);
            }
          } else {
            // Apply normalized scale to all other sensations
            mesh.scale.setScalar(particle.size * normalizedScale);
            
            // Update sprite material opacity
            const material = (mesh as any).material;
            if (material) {
              material.opacity = opacity;
            }
          }
        }
      });
    });
  });

  const renderParticleSystem = (mark: typeof sensationMarks[0]) => {
    const particles = particleSystems[mark.id];
    console.log('🦋 SensationParticles - Rendering particle system for mark:', mark.id, 'particles:', particles?.length);
    if (!particles) return null;

    // Store mesh refs for this mark
    const meshes: THREE.Object3D[] = [];
    meshRefsRef.current.set(mark.id, meshes);

    // Get the appropriate texture for this sensation mark
    const sensationTexture = getSensationTexture(mark.name || mark.icon);
    const normalizedScale = getNormalizedScale(mark.name || mark.icon);

    return particles.map((particle, index) => {
      const opacity = 1 - (particle.life / particle.maxLife);
      const finalScale = particle.size * 1.5 * normalizedScale;
      
      // Use sprites for all sensation types with their appropriate textures
      return (
        <sprite 
          key={`${mark.id}-${index}`}
          ref={(ref) => { if (ref) meshes[index] = ref; }}
          position={particle.position} 
          scale={[finalScale, finalScale, 1]}
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
