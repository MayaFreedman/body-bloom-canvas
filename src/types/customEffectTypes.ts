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
  'heart', 'star', 'lightning-bolt', 'fire', 'water', 'wind', 'snowflakes',
  'butterfly', 'flower', 'sun', 'moon', 'sparkles', 'circle', 'triangle'
] as const;

export type AvailableIcon = typeof AVAILABLE_ICONS[number];