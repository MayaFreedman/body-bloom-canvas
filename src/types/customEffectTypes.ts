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
  'alarm', 'baloon', 'biceps', 'broken-heart', 'butterfly', 'cat', 'chicken', 
  'create', 'desert', 'dog', 'explosion', 'feet', 'feetred', 'fidget-spinner',
  'fire', 'flower', 'frog', 'goosebump', 'heart', 'lightbulb', 'lightning-bolt',
  'monkey', 'musical-note', 'nautical-knot', 'pain', 'plate', 'plus', 'racecar',
  'relax', 'resistor', 'robot', 'roller-coaster', 'shake', 'shield', 'snail',
  'snowflakes', 'spaceship', 'star', 'statue', 'stone', 'storm', 'supportheart',
  'sweat', 'swirl', 'tornado', 'turtle', 'virus', 'water', 'wavy', 'wind', 'wings', 'zzz'
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];