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
  
  emotionalColors.forEach(emotion => {
    if (usedColors.has(emotion.color)) {
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

  bodySensations.forEach(sensation => {
    if (usedSensations.has(sensation.name) || usedSensations.has(sensation.icon)) {
      legendItems.push({
        type: 'sensation',
        name: sensation.name,
        color: sensation.color,
        icon: sensation.icon
      });
    }
  });

  return legendItems;
}