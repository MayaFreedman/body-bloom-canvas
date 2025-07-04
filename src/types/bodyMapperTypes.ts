
import * as THREE from 'three';

export interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

export interface SensationMark {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
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

export type BodyMapperMode = 'draw' | 'fill' | 'sensations' | 'erase';

export interface SelectedSensation {
  icon: string;
  color: string;
  name: string;
}
