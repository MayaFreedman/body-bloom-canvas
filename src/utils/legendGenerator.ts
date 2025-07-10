import { emotionalColors, bodySensations } from '@/constants/bodyMapperConstants';
import { SensationMark } from '@/types/bodyMapperTypes';

export interface LegendItem {
  type: 'emotion' | 'sensation';
  name: string;
  color: string;
  icon?: string;
}

interface CustomEmotion {
  color: string;
  name: string;
}

export function generateLegendData(
  selectedEmotions: CustomEmotion[],
  sensationMarks: SensationMark[]
): LegendItem[] {
  const legendItems: LegendItem[] = [];

  // Add emotions that have been configured (have names)
  selectedEmotions.forEach((emotion, index) => {
    // Only include emotions that have been given a name (not just default placeholder)
    if (emotion.name && emotion.name.trim() !== '' && emotion.name !== 'Enter emotion') {
      console.log('✅ Adding selected emotion to legend:', emotion.name, emotion.color);
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