import { CustomEffectForm, CustomSensation, AvailableIcon } from '@/types/customEffectTypes';

// Generate a unique ID for custom effects
export const generateCustomEffectId = (): string => {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert form data to custom sensation
export const createCustomSensation = (form: CustomEffectForm): CustomSensation => {
  const customSensation: CustomSensation = {
    id: generateCustomEffectId(),
    name: form.name,
    icon: form.selectedIcon, // This becomes the main icon field
    selectedIcon: form.selectedIcon, // Store the selected PNG name here too
    color: form.color,
    isCustom: true,
    movementBehavior: form.movementBehavior,
    createdAt: Date.now(),
  };
  return customSensation;
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
    
    // Import map for the PNG files (selected ones from reference, minus create)
    const iconImageMap: Record<AvailableIcon, string> = {
      'flower': '/src/Assets/particleEffects/flower.png',
      'tornado': '/src/Assets/particleEffects/tornado.png',
      'chicken': '/src/Assets/particleEffects/chicken.png',
      'storm': '/src/Assets/particleEffects/storm.png',
      'explosion': '/src/Assets/particleEffects/explosion.png',
      'supportheart': '/src/Assets/particleEffects/supportheart.png',
      'baloon': '/src/Assets/particleEffects/baloon.png',
      'musical-note': '/src/Assets/particleEffects/musical-note.png',
      'cat': '/src/Assets/particleEffects/cat.png',
      'dog': '/src/Assets/particleEffects/dog.png',
      'racecar': '/src/Assets/particleEffects/racecar.png',
      'roller-coaster': '/src/Assets/particleEffects/roller-coaster.png',
      'broken-heart': '/src/Assets/particleEffects/broken-heart.png',
      'robot': '/src/Assets/particleEffects/robot.png',
      'biceps': '/src/Assets/particleEffects/biceps.png',
      'wings': '/src/Assets/particleEffects/wings.png',
      'alarm': '/src/Assets/particleEffects/alarm.png',
      'lightbulb': '/src/Assets/particleEffects/lightbulb.png',
      'spaceship': '/src/Assets/particleEffects/spaceship.png',
      'shield': '/src/Assets/particleEffects/shield.png',
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
  }
};

export const loadCustomEffects = (): CustomSensation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const effects = JSON.parse(stored);
    
    return effects.map((effect: any) => ({
      ...effect,
      isCustom: true,
      movementBehavior: effect.movementBehavior || 'moderate'
    }));
  } catch (error) {
    return [];
  }
};