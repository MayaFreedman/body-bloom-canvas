
import * as THREE from 'three';
import { Room } from 'colyseus.js';
import { SurfaceDrawingPoint } from '@/utils/surfaceCoordinates';

export interface DrawingStroke {
  id: string;
  points: SurfaceDrawingPoint[];
  playerId: string;
}

export interface SensationData {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
  playerId: string;
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
}
