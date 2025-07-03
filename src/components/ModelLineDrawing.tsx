
import React from 'react';
import { useLineDrawingEvents } from '@/hooks/useLineDrawingEvents';
import { useDrawingEventListeners } from '@/hooks/useDrawingEventListeners';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { LineDrawing } from './LineDrawing';
import * as THREE from 'three';

interface LineStroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  width: number;
}

interface ModelLineDrawingProps {
  isDrawing: boolean;
  lineStrokes: LineStroke[];
  selectedColor: string;
  brushSize: number;
  onAddStroke: (stroke: LineStroke) => void;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onAddToStroke?: (worldPoint: WorldDrawingPoint) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const ModelLineDrawing = ({ 
  isDrawing, 
  lineStrokes, 
  selectedColor, 
  brushSize, 
  onAddStroke,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  modelRef 
}: ModelLineDrawingProps) => {
  const drawingEvents = useLineDrawingEvents({
    isDrawing,
    selectedColor,
    brushSize,
    onAddStroke,
    onStrokeStart,
    onStrokeComplete,
    onAddToStroke,
    modelRef
  });

  useDrawingEventListeners({
    isDrawing,
    ...drawingEvents
  });

  return <LineDrawing strokes={lineStrokes} />;
};
