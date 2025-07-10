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

// Generate a colored icon image using canvas
export const generateCustomEffectImage = (
  iconName: AvailableIcon, 
  color: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 64;
    canvas.height = 64;
    
    // Clear canvas
    ctx.clearRect(0, 0, 64, 64);
    
    // Create simple icon representations
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    const centerX = 32;
    const centerY = 32;
    
    switch (iconName) {
      case 'heart':
        // Simple heart shape
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 8);
        ctx.bezierCurveTo(centerX, centerY - 4, centerX - 16, centerY - 12, centerX - 16, centerY);
        ctx.bezierCurveTo(centerX - 16, centerY + 8, centerX, centerY + 16, centerX, centerY + 8);
        ctx.bezierCurveTo(centerX, centerY + 16, centerX + 16, centerY + 8, centerX + 16, centerY);
        ctx.bezierCurveTo(centerX + 16, centerY - 12, centerX, centerY - 4, centerX, centerY + 8);
        ctx.fill();
        break;
        
      case 'star':
        // 5-pointed star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 144 - 90) * Math.PI / 180;
          const outerRadius = 16;
          const innerRadius = 8;
          
          const outerX = centerX + Math.cos(angle) * outerRadius;
          const outerY = centerY + Math.sin(angle) * outerRadius;
          
          const innerAngle = ((i + 0.5) * 144 - 90) * Math.PI / 180;
          const innerX = centerX + Math.cos(innerAngle) * innerRadius;
          const innerY = centerY + Math.sin(innerAngle) * innerRadius;
          
          if (i === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'lightning-bolt':
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(centerX - 4, centerY - 16);
        ctx.lineTo(centerX + 8, centerY - 16);
        ctx.lineTo(centerX - 2, centerY - 2);
        ctx.lineTo(centerX + 6, centerY - 2);
        ctx.lineTo(centerX - 8, centerY + 16);
        ctx.lineTo(centerX + 2, centerY + 2);
        ctx.lineTo(centerX - 6, centerY + 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'circle':
        // Simple circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'triangle':
        // Triangle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 14);
        ctx.lineTo(centerX - 12, centerY + 10);
        ctx.lineTo(centerX + 12, centerY + 10);
        ctx.closePath();
        ctx.fill();
        break;
        
      default:
        // Default to circle for unrecognized icons
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
    
    // Convert to data URL
    resolve(canvas.toDataURL('image/png'));
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