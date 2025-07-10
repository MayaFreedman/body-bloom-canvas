import { SelectedSensation } from './bodyMapperTypes';

export interface CustomSensation extends SelectedSensation {
  id: string;
  isCustom: true;
  selectedIcon: string;
  movementBehavior: 'gentle' | 'moderate' | 'energetic';
  createdAt: number;
}

export interface CustomEffectForm {
  name: string;
  selectedIcon: string;
  color: string;
  movementBehavior: 'gentle' | 'moderate' | 'energetic';
}

export const AVAILABLE_ICONS = [
  'flower', 'tornado', 'chicken', 'storm', 'explosion', 'supportheart', 'baloon', 'musical-note',
  'cat', 'dog', 'racecar', 'roller-coaster', 'broken-heart', 'robot', 'biceps',
  'wings', 'alarm', 'lightbulb', 'spaceship', 'shield'
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];