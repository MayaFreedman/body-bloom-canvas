
import * as THREE from 'three';

export interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  timestamp: number;
  strokeId: string;
  userId?: string; // Track which user created this mark
}

export interface DrawingStroke {
  id: string;
  marks: DrawingMark[];
  startTime: number;
  endTime: number;
  brushSize: number;
  color: string;
  isComplete: boolean;
  userId?: string; // Track which user created this stroke
}

export interface ActionHistoryItem {
  id: string;
  type: 'draw' | 'erase' | 'fill' | 'clear';
  timestamp: number;
  userId: string; // Required - every action must have a user ID
  data: {
    strokes?: DrawingStroke[];
    marks?: DrawingMark[];
    bodyPartColors?: Record<string, string>;
    erasedMarks?: DrawingMark[];
    affectedArea?: {
      center: THREE.Vector3;
      radius: number;
    };
  };
  metadata?: {
    brushSize?: number;
    color?: string;
    bodyPart?: string;
  };
}

export interface UserActionHistory {
  items: ActionHistoryItem[];
  currentIndex: number;
  maxHistorySize: number;
}

export interface ActionHistory {
  userHistories: Map<string, UserActionHistory>;
  maxHistorySize: number;
}

export interface SpatialNode {
  bounds: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
  marks: DrawingMark[];
  children?: SpatialNode[];
}
