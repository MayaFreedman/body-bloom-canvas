import * as THREE from 'three';

export interface TextMark {
  id: string;
  position: THREE.Vector3;
  text: string;
  fontSize: number;
  color: string;
  rotation?: { x: number; y: number; z: number };
  surface: 'body' | 'whiteboard';
  backgroundColor?: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  isEditing?: boolean;
  userId?: string;
  timestamp?: number;
}

export interface TextSettings {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  backgroundColor?: string;
}

export interface TextData {
  id: string;
  position: THREE.Vector3;
  text: string;
  fontSize: number;
  color: string;
  surface: 'body' | 'whiteboard';
  playerId: string;
}