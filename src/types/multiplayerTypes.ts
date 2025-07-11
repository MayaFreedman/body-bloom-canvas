
import * as THREE from 'three';
import { Room } from 'colyseus.js';

export interface WorldDrawingPoint {
  id: string;
  worldPosition: { x: number; y: number; z: number };
  bodyPart?: string; // Optional for whiteboard drawings
  whiteboardRegion?: string; // For whiteboard surface identification
  surface: 'body' | 'whiteboard';
  color: string;
  size: number;
}

export interface StrokeKeyPoint {
  id: string;
  worldPosition: { x: number; y: number; z: number };
  bodyPart?: string;
  whiteboardRegion?: string;
  surface: 'body' | 'whiteboard';
  timestamp: number;
  isDirectionChange?: boolean;
}

export interface OptimizedDrawingStroke {
  id: string;
  keyPoints: StrokeKeyPoint[];
  metadata: {
    color: string;
    size: number;
    startTime: number;
    endTime: number;
    totalLength: number;
  };
  playerId: string;
}

export interface DrawingStroke {
  id: string;
  points: WorldDrawingPoint[];
  playerId: string;
}

export interface SensationData {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  name: string; // Add name field for particle image determination
  size: number;
  playerId: string;
  movementBehavior?: 'gentle' | 'moderate' | 'energetic';
  isCustom?: boolean;
}

export interface BodyPartFill {
  partName: string;
  color: string;
  playerId: string;
}

export interface PlayerCursor {
  playerId: string;
  position: { x: number; y: number };
  color: string;
  name: string;
}

export interface MultiplayerState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  players: Map<string, PlayerCursor>;
  currentPlayerId: string | null;
  playerColor: string;
  joinedAt: number | null;
}
