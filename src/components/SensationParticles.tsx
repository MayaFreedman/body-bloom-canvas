
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
    console.log('🦋 SensationParticles - Loading butterfly texture from:', butterflyTexture);
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
    console.log('🦋 SensationParticles - Sensation:', sensationName, 'mapped to texture key:', textureKey);
    const texture = textureMap[textureKey];
    console.log('🦋 SensationParticles - Texture object:', texture, 'loaded:', texture?.image?.complete);
    return texture;
  };

  // Get normalized scale for different textures
  const getNormalizedScale = (sensationName: string) => {
    const scaleMapping: { [key: string]: number } = {
      'Nerves': 1.2,
      'Pain': 0.8,
      'Nausea': 1.0,
      'Tears': 0.6,
      'Decreased Temperature': 0.6, // Smaller snowflakes
      'Increased Temperature': 0.9,
      'Increased Heart Rate': 0.8,
      'Decreased Heart Rate': 0.8,
      'Tired': 1.1,
      'Change in Breathing': 0.4, // Reduced from 1.0 - wind image is small
      'Tingling': 0.7,
      'Shaky': 0.3, // Reduced from 1.0 - shake image is small  
      'Pacing': 1.2,
      'Stomping': 1.6, // Bigger than pacing for more exaggerated look
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

  // Get dispersion level based on sensation type (much larger areas for natural spread)
  const getDispersionLevel = (sensationName: string) => {
    const dispersionMap: { [key: string]: number } = {
      // FAST/JERKY = very large spread across body areas
      'Nerves': 0.15,            // Spread across entire body region
      'Shaky': 0.12,             // Large area for trembling
      'Tingling': 0.10,          // Wide sparkle coverage
      'Goosebumps': 0.08,        // Goosebumps spread naturally
      'Fidgety': 0.11,           // Restless across area
      
      // ACTIVE = large spread for movement visibility
      'Change in Energy': 0.09,  // Energy across body part
      'Pacing': 0.07,            // Movement patterns
      'Stomping': 0.07,          // Same as pacing for identical base behavior
      'Avoiding Eye Contact': 0.08, // Face/head area
      'Scrunched Face': 0.06,    // Facial area
      
      // MEDIUM SPEED = good spread across body parts
      'Nausea': 0.08,            // Stomach/torso area
      'Increased Heart Rate': 0.07, // Chest area coverage
      'Pain': 0.06,              // Pain area coverage
      'Change in Breathing': 0.08, // Chest/torso breathing
      'Ache': 0.05,              // Localized but spread
      'Clenched': 0.05,          // Muscle area
      'Change in Appetite': 0.06, // Stomach area
      
      // MEDIUM-SLOW = moderate spread
      'Tears': 0.04,             // Face area for tears
      'Sweat': 0.10,             // Wider spread for sweating
      'Decreased Temperature': 0.15, // Even wider spread for more dispersed snow
      'Tight': 0.04,             // Tension area
      'Dry Mouth': 0.03,         // Mouth/throat area
      
      // VERY SLOW = still spread but smaller
      'Frozen/Stiff': 0.03,      // Small but visible area
      'Heaviness': 0.04,         // Weight across area
      'Lump in Throat': 0.02,    // Throat area
      'Relaxed': 0.05,           // Calm across area
      'Decreased Heart Rate': 0.04 // Chest area
    };
    return dispersionMap[sensationName] || 0.06;
  };

  // Get particle size based on sensation movement type
  const getParticleSize = (sensationName: string) => {
    const sizeMap: { [key: string]: { base: number; variance: number; multiplier: number } } = {
      // VERY SLOW/STATIC = largest, regenerate least frequently
      'Frozen/Stiff': { base: 0.09, variance: 0.045, multiplier: 3.0 }, // Biggest, almost static
      'Heaviness': { base: 0.08, variance: 0.04, multiplier: 2.7 }, // Heavy, weighty feeling
      'Lump in Throat': { base: 0.075, variance: 0.035, multiplier: 2.5 }, // Significant blockage feeling
      
      // SLOW/CALM = large, infrequent regeneration  
      'Relaxed': { base: 0.07, variance: 0.035, multiplier: 2.3 }, // Calm, visible
      'Decreased Heart Rate': { base: 0.07, variance: 0.035, multiplier: 2.3 }, // Slow, large beats
      'Statue': { base: 0.08, variance: 0.04, multiplier: 2.6 }, // Statue-like stillness
      
      // MEDIUM-SLOW = medium-large particles
      'Tears': { base: 0.055, variance: 0.03, multiplier: 2.0 }, // Visible droplets
      'Sweat': { base: 0.05, variance: 0.025, multiplier: 1.9 }, // Visible drips  
      'Pain': { base: 0.06, variance: 0.03, multiplier: 2.1 }, // Need to see pain clearly
      'Ache': { base: 0.055, variance: 0.03, multiplier: 2.0 }, // Visible discomfort
      'Tight': { base: 0.055, variance: 0.025, multiplier: 2.0 }, // Tension
      'Dry Mouth': { base: 0.05, variance: 0.025, multiplier: 1.9 }, // Noticeable dryness
      
      // MEDIUM = medium particles, moderate regeneration
      'Nausea': { base: 0.045, variance: 0.025, multiplier: 1.7 }, // Visible swirling
      'Increased Heart Rate': { base: 0.045, variance: 0.02, multiplier: 1.7 }, // Fast but visible beats
      'Change in Breathing': { base: 0.04, variance: 0.02, multiplier: 1.6 }, // Air movement
      'Change in Appetite': { base: 0.04, variance: 0.02, multiplier: 1.6 }, // Noticeable change
      'Clenched': { base: 0.045, variance: 0.02, multiplier: 1.7 }, // Muscle tension
      
      // ACTIVE = medium particles for visibility
      'Change in Energy': { base: 0.04, variance: 0.02, multiplier: 1.5 }, // Energy bursts
      'Fidgety': { base: 0.035, variance: 0.015, multiplier: 1.4 }, // Restless movement
      'Pacing': { base: 0.04, variance: 0.02, multiplier: 1.5 }, // Movement patterns
      'Stomping': { base: 0.045, variance: 0.025, multiplier: 1.7 }, // Bigger particles than pacing
      'Avoiding Eye Contact': { base: 0.035, variance: 0.015, multiplier: 1.4 }, // Nervous behavior
      'Scrunched Face': { base: 0.04, variance: 0.02, multiplier: 1.5 }, // Facial tension
      
      // FAST/JERKY = smaller but still visible, frequent regeneration
      'Tingling': { base: 0.03, variance: 0.015, multiplier: 1.3 }, // Sparkle effect
      'Shaky': { base: 0.035, variance: 0.015, multiplier: 1.4 }, // Trembling
      'Nerves': { base: 0.025, variance: 0.012, multiplier: 1.2 }, // Electrical, dispersed
      'Goosebumps': { base: 0.025, variance: 0.012, multiplier: 1.2 }, // Small bumps
      
      // SMALLEST = appropriately tiny
      'Feeling Small': { base: 0.02, variance: 0.01, multiplier: 1.0 } // Appropriately small
    };
    
    const config = sizeMap[sensationName] || { base: 0.04, variance: 0.02, multiplier: 1.5 };
    return (config.base + Math.random() * config.variance) * config.multiplier;
  };

  // Get particle lifespan based on sensation type (how often they regenerate)
  const getParticleLifespan = (sensationName: string) => {
    const lifespanMap: { [key: string]: { min: number; max: number } } = {
      // VERY SLOW = very long lifespan (slow stamping effect)
      'Frozen/Stiff': { min: 300, max: 500 }, // Almost never regenerates
      'Heaviness': { min: 250, max: 400 }, // Very slow regeneration
      'Lump in Throat': { min: 220, max: 350 }, // Persistent feeling
      
      // SLOW = long lifespan
      'Relaxed': { min: 180, max: 280 }, // Calm, persistent
      'Decreased Heart Rate': { min: 160, max: 250 }, // Slow rhythm
      'Decreased Temperature': { min: 120, max: 200 }, // Snow particles last medium time
      'Statue': { min: 200, max: 300 }, // Very still
      
      // MEDIUM-SLOW = medium-long lifespan - LONGER for drips
      'Tears': { min: 40, max: 80 }, // Tears regenerate much faster for more droplets
      'Sweat': { min: 180, max: 300 }, // Sweat beads last longer for dripping
      'Pain': { min: 100, max: 160 }, // Pain lingers
      'Ache': { min: 110, max: 170 }, // Aches persist
      'Tight': { min: 120, max: 180 }, // Tension holds
      'Dry Mouth': { min: 140, max: 220 }, // Dryness persists
      
      // MEDIUM = normal lifespan
      'Nausea': { min: 80, max: 140 }, // Swirling motion
      'Increased Heart Rate': { min: 60, max: 120 }, // Faster rhythm
      'Change in Breathing': { min: 70, max: 130 }, // Breathing cycles
      'Change in Appetite': { min: 90, max: 150 }, // Moderate change
      'Clenched': { min: 80, max: 140 }, // Tension comes and goes
      
      // ACTIVE = shorter lifespan, more dynamic
      'Change in Energy': { min: 50, max: 100 }, // Energy bursts
      'Fidgety': { min: 40, max: 80 }, // Restless, changing
      'Pacing': { min: 60, max: 100 }, // Movement patterns
      'Stomping': { min: 90, max: 160 }, // Slower respawn than pacing for slower movement
      'Avoiding Eye Contact': { min: 45, max: 85 }, // Nervous behavior
      'Scrunched Face': { min: 40, max: 80 }, // Facial expressions
      
      // FAST/JERKY = short lifespan, frequent regeneration
      'Tingling': { min: 30, max: 60 }, // Quick sparkles
      'Shaky': { min: 25, max: 50 }, // Rapid trembling
      'Nerves': { min: 20, max: 45 }, // Electrical, quick
      'Goosebumps': { min: 35, max: 70 }, // Brief bumps
      
      // SMALLEST = quick regeneration
      'Feeling Small': { min: 40, max: 80 } // Brief moments
    };
    
    const config = lifespanMap[sensationName] || { min: 80, max: 140 };
    return config.min + Math.random() * (config.max - config.min);
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
            // VERY SLOW = fewer particles since they last very long (slow stamping)
            'Frozen/Stiff': 3,          // Very few, long-lasting particles
            'Heaviness': 4,             // Few, heavy particles
            'Lump in Throat': 5,        // Minimal, persistent blockage
            
            // SLOW = fewer particles, longer lasting
            'Relaxed': 6,               // Calm, fewer particles
            'Decreased Heart Rate': 5,  // Slow, large beats
            'Decreased Temperature': 16, // More snow particles for better coverage
            
            // MEDIUM-SLOW = medium count
            'Tears': 8,                 // Droplets
            'Sweat': 8,                 // Reduced from 10 - fewer particles
            'Pain': 12,                 // Visible pain
            'Ache': 10,                 // Persistent aches
            'Tight': 8,                 // Tension areas
            'Dry Mouth': 7,             // Dryness
            
            // MEDIUM = normal count
            'Nausea': 15,               // Swirling
            'Increased Heart Rate': 12, // Fast beats but visible
            'Change in Breathing': 15,  // Air movement
            'Change in Appetite': 10,   // Appetite changes
            'Clenched': 12,             // Muscle tension
            
            // ACTIVE = higher count for movement
            'Change in Energy': 20,     // Energy bursts
            'Fidgety': 25,              // Restless movement
      'Pacing': 18,               // Movement patterns
      'Stomping': 18,             // Same count as pacing
            'Avoiding Eye Contact': 12, // Nervous behavior
            'Scrunched Face': 10,       // Facial tension
            
            // FAST/JERKY = high count, short-lived
            'Nerves': 20,               // Reduced from 30 - fewer particles
            'Tingling': 25,             // Sparkles
            'Shaky': 35,                // Rapid trembling
            'Goosebumps': 20,           // Small bumps
            
            // SPECIAL
            'Feeling Small': 8          // Appropriately few
          };
          return densityMapping[sensationName] || 12;
        };
        
        const particleCount = getParticleCount(mark.name || mark.icon);
        
        const dispersion = getDispersionLevel(mark.name || mark.icon);
        
        for (let i = 0; i < particleCount; i++) {
          // Create initial velocity that matches the sensation's animation pattern
          let initialVelocity;
          
          if (mark.name === 'Tears' || mark.name === 'Sweat' || mark.name === 'Decreased Temperature') {
            // Dripping/snow particles start with downward movement
            const isSnow = mark.name === 'Decreased Temperature';
            initialVelocity = new THREE.Vector3(
              (Math.random() - 0.5) * (isSnow ? 0.0005 : 0.0003), // Snow has more horizontal drift
              -0.0003 - Math.random() * (isSnow ? 0.0002 : 0.0004), // Snow falls more gently
              (Math.random() - 0.5) * (isSnow ? 0.0004 : 0.0002)  // Snow has more depth movement
            );
          } else if (mark.name === 'Increased Heart Rate' || mark.name === 'Decreased Heart Rate') {
            // Heart rate particles start with gentle pulsing movement
            initialVelocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.0003, // Minimal horizontal
              (Math.random() - 0.5) * 0.0008, // Gentle vertical for pulsing
              (Math.random() - 0.5) * 0.0002  // Minimal depth
            );
          } else if (mark.name === 'Nerves' || mark.name === 'Tingling') {
            // Electrical particles start with quick, small movements
            initialVelocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.001,
              (Math.random() - 0.5) * 0.0008,
              (Math.random() - 0.5) * 0.001
            );
          } else if (mark.name === 'Shaky' || mark.name === 'Fidgety') {
            // Shaky particles start with trembling movement
            initialVelocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.0015,
              (Math.random() - 0.5) * 0.001,
              (Math.random() - 0.5) * 0.0015
            );
          } else {
            // Default gentle floating movement for other sensations
            initialVelocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.0006,
              Math.random() * 0.0008, // Natural floating tendency
              (Math.random() - 0.5) * 0.0006
            );
          }
          
          const baseParticle = {
            position: new THREE.Vector3(
              mark.position.x + (Math.random() - 0.5) * dispersion,
              mark.position.y + (Math.random() - 0.5) * dispersion,
              mark.position.z + (Math.random() - 0.5) * dispersion
            ),
            velocity: initialVelocity,
            life: Math.random() * 100,
            maxLife: getParticleLifespan(mark.name || mark.icon),
            size: getParticleSize(mark.name || mark.icon),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            oscillationPhase: Math.random() * Math.PI * 2,
            oscillationSpeed: 0.8 + Math.random() * 2.2
          };

          // Add special properties for nerves/electrical particles  
          if (mark.icon === 'Activity' || mark.name === 'Nerves' || mark.name === 'Tingling') {
            particles.push({
              ...baseParticle,
              sparkIntensity: Math.random(),
              flickerPhase: Math.random() * Math.PI * 2,
              electricalPulse: Math.random() * Math.PI * 2,
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.001,
                (Math.random() - 0.5) * 0.0008,
                (Math.random() - 0.5) * 0.001
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
        
        // Update electrical properties for nerves and tingling
        if ((mark.icon === 'Activity' || mark.name === 'Nerves' || mark.name === 'Tingling') && particle.electricalPulse !== undefined) {
          particle.electricalPulse += delta * 12;
          particle.flickerPhase! += delta * 20;
        }
        
        // Reset particle if it's dead
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          
          // Find a spawn position that avoids clustering with other particles
          const findAvailableSpawnPosition = () => {
            const baseDispersion = getDispersionLevel(mark.name || mark.icon);
            const minDistance = baseDispersion * 0.3; // Minimum distance between particles
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
              const candidatePosition = mark.position.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * baseDispersion,
                (Math.random() - 0.5) * baseDispersion,
                (Math.random() - 0.5) * baseDispersion
              ));
              
              // Check distance to other particles (except current one)
              let tooClose = false;
              for (let i = 0; i < particles.length; i++) {
                if (i === index) continue; // Skip self
                const otherParticle = particles[i];
                const distance = candidatePosition.distanceTo(otherParticle.position);
                if (distance < minDistance) {
                  tooClose = true;
                  break;
                }
              }
              
              if (!tooClose) {
                return candidatePosition;
              }
              attempts++;
            }
            
            // Fallback: if can't find good spot, use a position with larger dispersion
            return mark.position.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * baseDispersion * 1.5,
              (Math.random() - 0.5) * baseDispersion * 1.5,
              (Math.random() - 0.5) * baseDispersion * 1.5
            ));
          };
          
          particle.position.copy(findAvailableSpawnPosition());
          
          // Reset animation properties
          particle.rotation = Math.random() * Math.PI * 2;
          particle.oscillationPhase = Math.random() * Math.PI * 2;
          
          if (mark.icon === 'Activity' || mark.name === 'Nerves' || mark.name === 'Tingling') {
            particle.flickerPhase = Math.random() * Math.PI * 2;
            particle.electricalPulse = Math.random() * Math.PI * 2;
            particle.sparkIntensity = Math.random();
            
            // Reset velocity for nerves with more variation
            particle.velocity.set(
              (Math.random() - 0.5) * 0.001,
              (Math.random() - 0.5) * 0.0008,
              (Math.random() - 0.5) * 0.001
            );
          } else if (mark.name === 'Tears' || mark.name === 'Sweat' || mark.name === 'Decreased Temperature') {
            // Reset velocity for dripping particles - consistent with lifecycle movement
            const isSnow = mark.name === 'Decreased Temperature';
            particle.velocity.set(
              (Math.random() - 0.5) * (isSnow ? 0.0005 : 0.0003), // Snow has more horizontal drift
              -0.0003 - Math.random() * (isSnow ? 0.0002 : 0.0004), // Snow falls more gently
              (Math.random() - 0.5) * (isSnow ? 0.0004 : 0.0002)  // Snow has more depth movement
            );
          } else if (mark.icon === 'butterfly') {
            // Reset butterfly velocity with more natural variation
            particle.velocity.set(
              (Math.random() - 0.5) * 0.0008,
              Math.random() * 0.0006, // Slight upward bias
              (Math.random() - 0.5) * 0.0008
            );
          } else {
            // Default reset with natural variation
            particle.velocity.set(
              (Math.random() - 0.5) * 0.0006,
              Math.random() * 0.0008, // Natural floating tendency
              (Math.random() - 0.5) * 0.0006
            );
          }
        }
        
        // Get animation intensity and speed for this sensation
        const getAnimationProfile = (sensationName: string) => {
          const profiles: { [key: string]: { speed: number; intensity: number; pattern: string; gravity?: number; drift?: THREE.Vector3 } } = {
            // ELECTRICAL/ACTIVE effects
            'Nerves': { speed: 0.3, intensity: 0.3, pattern: 'electrical', gravity: 0.0002 },
            'Tingling': { speed: 1.8, intensity: 1.2, pattern: 'electrical', gravity: 0.0001 }, // Use electrical pattern for sparkly movement
            'Change in Energy': { speed: 1.5, intensity: 1.0, pattern: 'burst', gravity: 0.0001, drift: new THREE.Vector3(0, 0.3, 0) },
            
            // HEART RATE effects  
            'Increased Heart Rate': { speed: 2.5, intensity: 1.2, pattern: 'pulse' }, // Fast pulsing
            'Decreased Heart Rate': { speed: 0.8, intensity: 0.6, pattern: 'pulse' }, // Slow pulsing
            
            // MOVEMENT effects
            'Shaky': { speed: 3.0, intensity: 1.8, pattern: 'shake' }, // Fast trembling
            'Fidgety': { speed: 2.2, intensity: 1.4, pattern: 'shake' }, // Restless movement
            'Pacing': { speed: 0.3, intensity: 0.3, pattern: 'gentle' }, // Very gentle movement
            'Stomping': { speed: 0.15, intensity: 0.4, pattern: 'gentle' }, // Extremely gentle
            
            // FLOW effects - dripping with strong downward movement (negative Y = down)
            'Tears': { speed: 0.2, intensity: 0.4, pattern: 'drip', gravity: 0.0002, drift: new THREE.Vector3(0, -0.15, 0) },
            'Sweat': { speed: 0.3, intensity: 0.5, pattern: 'drip', gravity: 0.00015, drift: new THREE.Vector3(0, -0.12, 0) },
            'Decreased Temperature': { speed: 0.8, intensity: 0.7, pattern: 'drip', gravity: 0.0004, drift: new THREE.Vector3(0, -0.25, 0) },
            'Change in Breathing': { speed: 0.8, intensity: 0.7, pattern: 'wave', gravity: 0.0001, drift: new THREE.Vector3(0.1, 0.3, 0) },
            'Nausea': { speed: 1.2, intensity: 1.0, pattern: 'swirl', gravity: 0.0002 },
            
            // PAIN effects
            'Pain': { speed: 0.6, intensity: 0.8, pattern: 'throb', gravity: 0.0001 },
            'Ache': { speed: 0.5, intensity: 0.7, pattern: 'throb', gravity: 0.0001 },
            
            // STATIC/SLOW effects
            'Frozen/Stiff': { speed: 0.1, intensity: 0.3, pattern: 'minimal', gravity: 0.0001 }, // Barely moving
            'Heaviness': { speed: 0.2, intensity: 0.4, pattern: 'sink', gravity: 0.0006, drift: new THREE.Vector3(0, -0.8, 0) },
            'Relaxed': { speed: 0.4, intensity: 0.5, pattern: 'gentle', gravity: 0.0001 },
            
            // TENSION effects
            'Tight': { speed: 0.8, intensity: 0.9, pattern: 'constrain', gravity: 0.0001 },
            'Clenched': { speed: 1.0, intensity: 1.1, pattern: 'tense', gravity: 0.0001 },
            'Lump in Throat': { speed: 0.6, intensity: 0.8, pattern: 'stuck', gravity: 0.0001 }
          };
          return profiles[sensationName] || { speed: 0.8, intensity: 0.6, pattern: 'flow', gravity: 0.0002, drift: new THREE.Vector3(0, 0.2, 0) };
        };
        
        const animProfile = getAnimationProfile(mark.name || mark.icon);

        // Update position based on animation profile with natural physics
        if (animProfile.pattern === 'electrical' || mark.icon === 'Activity' || mark.name === 'Nerves' || mark.name === 'Tingling') {
          // Electrical effects: gentler sparking with fluid movement
          const electricalJitter = Math.sin(particle.electricalPulse! * animProfile.speed) * 0.0005 * animProfile.intensity;
          const sparkDirection = Math.cos(time * 4 * animProfile.speed + particle.life * 0.1) * 0.0004 * animProfile.intensity;
          
          // Less frequent electrical impulses for calmer feeling
          if (Math.random() < 0.04 * animProfile.speed) {
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.0015 * animProfile.intensity,
              (Math.random() - 0.5) * 0.001 * animProfile.intensity,
              (Math.random() - 0.5) * 0.0015 * animProfile.intensity
            ));
          }
          
          // Apply gravity and movement
          particle.velocity.y += (animProfile.gravity || 0.0002) * delta;
          particle.position.add(particle.velocity);
          
          // Add gentler electrical jitter
          particle.position.x += electricalJitter;
          particle.position.y += sparkDirection;
          particle.position.z += electricalJitter * 0.5;
          
          // More damping for smoother movement
          particle.velocity.multiplyScalar(0.95);
          
        } else if (animProfile.pattern === 'shake') {
          // Shaky: rapid trembling with fluid movement
          const shakeForceX = Math.sin(time * 30 * animProfile.speed) * 0.003 * animProfile.intensity;
          const shakeForceY = Math.cos(time * 27 * animProfile.speed) * 0.002 * animProfile.intensity;
          const shakeForceZ = Math.sin(time * 33 * animProfile.speed) * 0.0025 * animProfile.intensity;
          
          // Add shake forces to velocity
          particle.velocity.x += shakeForceX * delta;
          particle.velocity.y += shakeForceY * delta;
          particle.velocity.z += shakeForceZ * delta;
          
          // Apply gravity and movement
          particle.velocity.y += (animProfile.gravity || 0.0001) * delta;
          particle.position.add(particle.velocity);
          particle.velocity.multiplyScalar(0.985); // Gentler damping
          
        } else if (animProfile.pattern === 'pulse') {
          // Heart rate: pulsing with rhythmic movement
          const pulseForce = Math.sin(time * 10 * animProfile.speed) * 0.002 * animProfile.intensity;
          const beatDirection = Math.cos(time * 20 * animProfile.speed) * 0.001 * animProfile.intensity;
          
          // Add pulsing forces
          particle.velocity.y += pulseForce * delta;
          particle.velocity.x += beatDirection * delta * 0.5;
          particle.velocity.z += beatDirection * delta * 0.3;
          
          // Apply movement
          particle.velocity.y += (animProfile.gravity || 0.0001) * delta;
          particle.position.add(particle.velocity);
          particle.velocity.multiplyScalar(0.99); // Very gentle damping for hearts
          
        } else if (animProfile.pattern === 'swirl') {
          // Nausea: fluid swirling motion
          const swirlForceX = Math.sin(particle.oscillationPhase * animProfile.speed) * 0.003 * animProfile.intensity;
          const swirlForceZ = Math.cos(particle.oscillationPhase * animProfile.speed * 0.8) * 0.002 * animProfile.intensity;
          const verticalSwirl = Math.sin(particle.oscillationPhase * animProfile.speed * 1.3) * 0.001 * animProfile.intensity;
          
          // Add swirling forces
          particle.velocity.x += swirlForceX * delta;
          particle.velocity.z += swirlForceZ * delta;
          particle.velocity.y += verticalSwirl * delta;
          
          // Apply movement
          particle.velocity.y += (animProfile.gravity || 0.0002) * delta;
          particle.position.add(particle.velocity);
          particle.velocity.multiplyScalar(0.93);
          
        } else if (animProfile.pattern === 'drip') {
          // Tears and Sweat: realistic dripping with consistent downward movement
          
          // Apply strong downward gravity (negative Y = down)
          if (animProfile.gravity) {
            particle.velocity.y -= animProfile.gravity * delta; // Subtract to go down
          }
          
          // Apply downward drift force  
          if (animProfile.drift) {
            const driftForce = animProfile.drift.clone().multiplyScalar(0.001 * animProfile.intensity * delta);
            particle.velocity.add(driftForce); // drift Y is already negative
          }
          
          // Very minimal side-to-side oscillation for natural drip variation
          const gentleSway = Math.sin(particle.oscillationPhase * animProfile.speed * 0.5) * 0.0001 * animProfile.intensity;
          particle.velocity.x += gentleSway * delta;
          
          // Apply movement
          particle.position.add(particle.velocity);
          
          // Minimal damping - let gravity do the work
          particle.velocity.multiplyScalar(0.998);
          
        } else if (mark.icon === 'butterfly' || mark.name === 'Nerves') {
          // Butterfly/Nerves: more realistic gentle movement
          const gentleFloat = Math.sin(time * 2 + particle.life * 0.3) * 0.0008 * (animProfile.intensity || 0.6);
          const naturalDrift = Math.cos(time * 1.5 + particle.life * 0.2) * 0.0006 * (animProfile.intensity || 0.6);
          const softVertical = Math.sin(particle.oscillationPhase * 1.2) * 0.0004 * (animProfile.intensity || 0.6);
          
          // Occasional gentle direction changes (less frequent)
          if (Math.random() < 0.015) {
            particle.velocity.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.0005,
              (Math.random() - 0.5) * 0.0004,
              (Math.random() - 0.5) * 0.0005
            ));
          }
          
          // Add gentle floating forces
          particle.velocity.x += gentleFloat * delta;
          particle.velocity.y += softVertical * delta;
          particle.velocity.z += naturalDrift * delta;
          
          // Very subtle upward tendency
          particle.velocity.y += 0.0001 * delta;
          particle.position.add(particle.velocity);
          particle.velocity.multiplyScalar(0.98); // More damping for realistic movement
          
        } else {
          // Default fluid movement for all other sensations
          
          // Apply gravity and drift forces
          if (animProfile.gravity) {
            particle.velocity.y += animProfile.gravity * delta;
          }
          
          if (animProfile.drift) {
            const driftForce = animProfile.drift.clone().multiplyScalar(0.001 * animProfile.intensity * delta);
            particle.velocity.add(driftForce);
          }
          
          // Add very gentle drift movement - no nauseating oscillations
          const gentleDriftX = Math.sin(time * 0.2 + particle.life * 0.01) * 0.0001 * animProfile.intensity;
          const gentleDriftY = Math.cos(time * 0.15) * 0.00005 * animProfile.intensity;
          const gentleDriftZ = Math.sin(time * 0.1) * 0.00003 * animProfile.intensity;
          
          particle.velocity.x += gentleDriftX * delta;
          particle.velocity.y += gentleDriftY * delta;
          particle.velocity.z += gentleDriftZ * delta;
          
          // Apply movement
          particle.position.add(particle.velocity);
          
          // Natural damping - much gentler to maintain movement
          particle.velocity.multiplyScalar(0.995);
        }

        // Update the corresponding mesh
        const mesh = meshes[index];
        if (mesh) {
          mesh.position.copy(particle.position);
          mesh.rotation.set(particle.rotation, particle.rotation * 1.3, particle.rotation * 0.8);
          
          // Update scale and opacity based on particle properties
          const opacity = 1 - (particle.life / particle.maxLife);
          const normalizedScale = getNormalizedScale(mark.name || mark.icon);
          
          if (mark.icon === 'Activity' || mark.name === 'Nerves') {
            const flickerIntensity = particle.flickerPhase !== undefined ? 0.4 + Math.sin(particle.flickerPhase) * 0.5 : 1;
            const pulseScale = particle.electricalPulse !== undefined ? 1 + Math.sin(particle.electricalPulse) * 0.8 : 1;
            mesh.scale.setScalar(particle.size * normalizedScale * pulseScale);
            
            // Update material properties for electrical effect
            const material = (mesh as any).material;
            if (material) {
              material.opacity = Math.max(0.1, opacity * flickerIntensity);
              if (material.emissiveIntensity !== undefined) {
                material.emissiveIntensity = flickerIntensity * 0.4;
              }
            }
          } else if (mark.icon === 'butterfly') {
            const wingScale = 1 + Math.sin(particle.oscillationPhase * 3) * 0.4;
            mesh.scale.setScalar(particle.size * normalizedScale * wingScale);
            
            // Update sprite material opacity
            const material = (mesh as any).material;
            if (material) {
              material.opacity = opacity * (0.7 + Math.sin(particle.oscillationPhase * 3) * 0.2);
            }
          } else if (mark.name === 'Stomping') {
            // Remove special impact pulse - use same pattern as pacing
            mesh.scale.setScalar(particle.size * normalizedScale);
            
            // Update sprite material opacity
            const material = (mesh as any).material;
            if (material) {
              material.opacity = opacity;
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
    
    console.log('🦋 SensationParticles - About to render', particles.length, 'particles with texture:', sensationTexture, 'scale:', normalizedScale);

    return particles.map((particle, index) => {
      const opacity = 1 - (particle.life / particle.maxLife);
      const finalScale = particle.size * 1.5 * normalizedScale;
      
      console.log('🦋 SensationParticles - Rendering particle', index, 'position:', particle.position.x, particle.position.y, particle.position.z, 'finalScale:', finalScale, 'opacity:', opacity);
      
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
