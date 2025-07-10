import { emotionalColors, bodySensations } from '@/constants/bodyMapperConstants';
import { SensationMark } from '@/types/bodyMapperTypes';

export interface LegendItem {
  type: 'emotion' | 'sensation';
  name: string;
  color: string;
  icon?: string;
}

export function generateLegendData(
  bodyPartColors: Record<string, string>,
  sensationMarks: SensationMark[]
): LegendItem[] {
  const legendItems: LegendItem[] = [];

  // Find active emotions (colors that are actually used)
  const usedColors = new Set(Object.values(bodyPartColors));
  console.log('🎨 Used colors from bodyPartColors:', usedColors, bodyPartColors);
  console.log('🎨 Available emotional colors:', emotionalColors.map(e => ({ name: e.name, color: e.color })));
  
  // Check for exact matches and case-insensitive matches
  emotionalColors.forEach(emotion => {
    const hasExactMatch = usedColors.has(emotion.color);
    const hasUppercaseMatch = usedColors.has(emotion.color.toUpperCase());
    const hasLowercaseMatch = usedColors.has(emotion.color.toLowerCase());
    
    console.log(`🔍 Checking emotion ${emotion.name} (${emotion.color}):`, {
      hasExactMatch,
      hasUppercaseMatch, 
      hasLowercaseMatch
    });
    
    if (hasExactMatch || hasUppercaseMatch || hasLowercaseMatch) {
      console.log('✅ Adding emotion to legend:', emotion.name, emotion.color);
      legendItems.push({
        type: 'emotion',
        name: emotion.name,
        color: emotion.color
      });
    }
  });

  // Find active sensations (sensations that are actually placed)
  const usedSensations = new Set(
    sensationMarks.map(mark => mark.name || mark.icon)
  );
  console.log('🎭 Used sensations from sensationMarks:', usedSensations, sensationMarks);

  bodySensations.forEach(sensation => {
    if (usedSensations.has(sensation.name) || usedSensations.has(sensation.icon)) {
      console.log('✅ Adding sensation to legend:', sensation.name, sensation.color);
      legendItems.push({
        type: 'sensation',
        name: sensation.name,
        color: sensation.color,
        icon: sensation.icon
      });
    }
  });

  console.log('📋 Final legend items:', legendItems);
  return legendItems;
}