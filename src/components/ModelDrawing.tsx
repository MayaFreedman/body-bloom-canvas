
import React from 'react';
import { useDrawingEvents } from '@/hooks/useDrawingEvents';
import { useDrawingEventListeners } from '@/hooks/useDrawingEventListeners';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface ModelDrawingProps {
  isDrawing: boolean;
  drawingMarks: DrawingMark[];
  selectedColor: string;
  brushSize: number;
  onAddMark: (mark: DrawingMark) => void;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const ModelDrawing = ({ 
  isDrawing, 
  drawingMarks, 
  selectedColor, 
  brushSize, 
  onAddMark,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  modelRef 
}: ModelDrawingProps) => {
  const drawingEvents = useDrawingEvents({
    isDrawing,
    selectedColor,
    brushSize,
    onAddMark,
    onStrokeStart,
    onStrokeComplete,
    onAddToStroke,
    modelRef
  });

  useDrawingEventListeners({
    isDrawing,
    ...drawingEvents
  });

  return null;
};
