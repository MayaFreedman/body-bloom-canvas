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
    
    // Import map for the PNG files (only unused ones)
    const iconImageMap: Record<AvailableIcon, string> = {
      'alarm': '/src/Assets/particleEffects/alarm.png',
      'baloon': '/src/Assets/particleEffects/baloon.png',
      'biceps': '/src/Assets/particleEffects/biceps.png',
      'broken-heart': '/src/Assets/particleEffects/broken-heart.png',
      'cat': '/src/Assets/particleEffects/cat.png',
      'chicken': '/src/Assets/particleEffects/chicken.png',
      'create': '/src/Assets/particleEffects/create.png',
      'dog': '/src/Assets/particleEffects/dog.png',
      'explosion': '/src/Assets/particleEffects/explosion.png',
      'flower': '/src/Assets/particleEffects/flower.png',
      'musical-note': '/src/Assets/particleEffects/musical-note.png',
      'plus': '/src/Assets/particleEffects/plus.png',
      'racecar': '/src/Assets/particleEffects/racecar.png',
      'resistor': '/src/Assets/particleEffects/resistor.png',
      'robot': '/src/Assets/particleEffects/robot.png',
      'roller-coaster': '/src/Assets/particleEffects/roller-coaster.png',
      'shield': '/src/Assets/particleEffects/shield.png',
      'spaceship': '/src/Assets/particleEffects/spaceship.png',
      'storm': '/src/Assets/particleEffects/storm.png',
      'supportheart': '/src/Assets/particleEffects/supportheart.png',
      'tornado': '/src/Assets/particleEffects/tornado.png',
      'turtle': '/src/Assets/particleEffects/turtle.png',
      'virus': '/src/Assets/particleEffects/virus.png',
      'wings': '/src/Assets/particleEffects/wings.png',
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