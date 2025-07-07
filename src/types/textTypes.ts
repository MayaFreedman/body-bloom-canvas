import * as THREE from 'three';

export interface TextMark {
  id: string;
  position: THREE.Vector3;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation?: { x: number; y: number; z: number };
  surface: 'body' | 'whiteboard';
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  isEditing?: boolean;
  userId?: string;
  timestamp?: number;
}

export interface TextSettings {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
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