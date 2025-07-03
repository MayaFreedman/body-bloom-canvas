
import * as THREE from 'three';

export interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  timestamp: number;
  strokeId: string;
}

export interface DrawingStroke {
  id: string;
  marks: DrawingMark[];
  startTime: number;
  endTime: number;
  brushSize: number;
  color: string;
  isComplete: boolean;
}

export interface ActionHistoryItem {
  id: string;
  type: 'draw' | 'erase' | 'fill' | 'clear';
  timestamp: number;
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

export interface ActionHistory {
  items: ActionHistoryItem[];
  currentIndex: number;
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
