
import * as THREE from 'three';
import { TextMark } from './textTypes';

export interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
  timestamp: number;
  strokeId: string;
  surface?: 'body' | 'whiteboard';
  userId?: string; // Keep for drawing tracking but not for undo/redo
}

export interface DrawingStroke {
  id: string;
  marks: DrawingMark[];
  surface?: 'body' | 'whiteboard';
  startTime: number;
  endTime: number;
  brushSize: number;
  color: string;
  isComplete: boolean;
  userId?: string; // Keep for drawing tracking but not for undo/redo
}

export interface SensationMark {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
}

export interface ActionHistoryItem {
  id: string;
  type: 'draw' | 'erase' | 'fill' | 'clear' | 'sensation' | 'textPlace' | 'textEdit' | 'textDelete' | 'resetAll';
  timestamp: number;
  data: {
    strokes?: DrawingStroke[];
    marks?: DrawingMark[];
    bodyPartColors?: Record<string, string>;
    previousBodyPartColors?: Record<string, string>;
    sensationMark?: SensationMark;
    previousSensationMarks?: SensationMark[];
    textMark?: TextMark;
    previousTextMarks?: TextMark[];
    erasedTextMarks?: TextMark[];
    erasedSensationMarks?: SensationMark[];
    previousText?: string;
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
    sensationType?: string;
    text?: string;
    itemCount?: number;
  };
}

export interface GlobalActionHistory {
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
