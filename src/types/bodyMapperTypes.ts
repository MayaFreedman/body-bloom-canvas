
import * as THREE from 'three';

export interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  surface?: 'body' | 'whiteboard';
  strokeId?: string;
  timestamp?: number;
  userId?: string;
}

export interface SensationMark {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
  name?: string;
  movementBehavior?: 'gentle' | 'moderate' | 'energetic';
  isCustom?: boolean;
}

export interface Effect {
  id: string;
  type: 'sparkle' | 'pulse' | 'flow';
  x: number;
  y: number;
  color: string;
  intensity: number;
}

export interface BodyPartColors {
  [key: string]: string;
}

export type BodyMapperMode = 'draw' | 'fill' | 'erase' | 'text' | 'sensation';

export type DrawingTarget = 'body' | 'whiteboard';

export interface SelectedSensation {
  icon: string;
  color: string;
  name: string;
  movementBehavior?: 'gentle' | 'moderate' | 'energetic';
  isCustom?: boolean;
  id?: string;
}
