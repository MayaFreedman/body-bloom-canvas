import { CustomEffectForm, CustomSensation, AvailableIcon } from '@/types/customEffectTypes';

// Generate a unique ID for custom effects
export const generateCustomEffectId = (): string => {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert form data to custom sensation
export const createCustomSensation = (form: CustomEffectForm): CustomSensation => {
  return {
    id: generateCustomEffectId(),
    name: form.name,
    icon: form.selectedIcon,
    color: form.color,
    selectedIcon: form.selectedIcon,
    movementBehavior: form.movementBehavior,
    isCustom: true,
    createdAt: Date.now(),
  };
};

// Generate a colored icon image using existing PNG and color overlay
export const generateCustomEffectImage = async (
  iconName: AvailableIcon, 
  color: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 64;
    canvas.height = 64;
    
    // Import map for the PNG files
    const iconImageMap: Record<AvailableIcon, string> = {
      'alarm': '/src/Assets/particleEffects/alarm.png',
      'baloon': '/src/Assets/particleEffects/baloon.png',
      'biceps': '/src/Assets/particleEffects/biceps.png',
      'broken-heart': '/src/Assets/particleEffects/broken-heart.png',
      'butterfly': '/src/Assets/particleEffects/butterfly.png',
      'cat': '/src/Assets/particleEffects/cat.png',
      'chicken': '/src/Assets/particleEffects/chicken.png',
      'create': '/src/Assets/particleEffects/create.png',
      'desert': '/src/Assets/particleEffects/desert.png',
      'dog': '/src/Assets/particleEffects/dog.png',
      'explosion': '/src/Assets/particleEffects/explosion.png',
      'feet': '/src/Assets/particleEffects/feet.png',
      'feetred': '/src/Assets/particleEffects/feetred.png',
      'fidget-spinner': '/src/Assets/particleEffects/fidget-spinner.png',
      'fire': '/src/Assets/particleEffects/fire.png',
      'flower': '/src/Assets/particleEffects/flower.png',
      'frog': '/src/Assets/particleEffects/frog.png',
      'goosebump': '/src/Assets/particleEffects/goosebump.png',
      'heart': '/src/Assets/particleEffects/heart.png',
      'lightbulb': '/src/Assets/particleEffects/lightbulb.png',
      'lightning-bolt': '/src/Assets/particleEffects/lightning-bolt.png',
      'monkey': '/src/Assets/particleEffects/monkey.png',
      'musical-note': '/src/Assets/particleEffects/musical-note.png',
      'nautical-knot': '/src/Assets/particleEffects/nautical-knot.png',
      'pain': '/src/Assets/particleEffects/pain.png',
      'plate': '/src/Assets/particleEffects/plate.png',
      'plus': '/src/Assets/particleEffects/plus.png',
      'racecar': '/src/Assets/particleEffects/racecar.png',
      'relax': '/src/Assets/particleEffects/relax.png',
      'resistor': '/src/Assets/particleEffects/resistor.png',
      'robot': '/src/Assets/particleEffects/robot.png',
      'roller-coaster': '/src/Assets/particleEffects/roller-coaster.png',
      'shake': '/src/Assets/particleEffects/shake.png',
      'shield': '/src/Assets/particleEffects/shield.png',
      'snail': '/src/Assets/particleEffects/snail.png',
      'snowflakes': '/src/Assets/particleEffects/snowflakes.png',
      'spaceship': '/src/Assets/particleEffects/spaceship.png',
      'star': '/src/Assets/particleEffects/star.png',
      'statue': '/src/Assets/particleEffects/statue.png',
      'stone': '/src/Assets/particleEffects/stone.png',
      'storm': '/src/Assets/particleEffects/storm.png',
      'supportheart': '/src/Assets/particleEffects/supportheart.png',
      'sweat': '/src/Assets/particleEffects/sweat.png',
      'swirl': '/src/Assets/particleEffects/swirl.png',
      'tornado': '/src/Assets/particleEffects/tornado.png',
      'turtle': '/src/Assets/particleEffects/turtle.png',
      'virus': '/src/Assets/particleEffects/virus.png',
      'water': '/src/Assets/particleEffects/water.png',
      'wavy': '/src/Assets/particleEffects/wavy.png',
      'wind': '/src/Assets/particleEffects/wind.png',
      'wings': '/src/Assets/particleEffects/wings.png',
      'zzz': '/src/Assets/particleEffects/zzz.png',
    };
    
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, 64, 64);
      
      // Draw the original image
      ctx.drawImage(img, 0, 0, 64, 64);
      
      // Apply color overlay (simplified approach)
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 64, 64);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      // Fallback: create a simple colored square with text
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = color;
      ctx.fillRect(16, 16, 32, 32);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.src = iconImageMap[iconName];
  });
};

// Storage functions
const STORAGE_KEY = 'body-mapper-custom-effects';

export const saveCustomEffects = (effects: CustomSensation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(effects));
  } catch (error) {
    console.warn('Failed to save custom effects:', error);
  }
};

export const loadCustomEffects = (): CustomSensation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load custom effects:', error);
    return [];
  }
};