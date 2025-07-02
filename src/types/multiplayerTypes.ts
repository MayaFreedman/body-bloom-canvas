import * as THREE from 'three';
import { Room } from 'colyseus.js';

export interface WorldDrawingPoint {
  id: string;
  worldPosition: { x: number; y: number; z: number };
  bodyPart: string;
  color: string;
  size: number;
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
