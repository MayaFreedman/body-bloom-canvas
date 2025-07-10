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
  'alarm', 'baloon', 'biceps', 'broken-heart', 'cat', 'chicken', 
  'create', 'dog', 'explosion', 'flower', 'musical-note', 'plus', 'racecar',
  'resistor', 'robot', 'roller-coaster', 'shield', 'spaceship', 'storm', 
  'supportheart', 'tornado', 'turtle', 'virus', 'wings'
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];