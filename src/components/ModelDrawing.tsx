
import React from 'react';
import { useDrawingEvents } from '@/hooks/useDrawingEvents';
import { useDrawingEventListeners } from '@/hooks/useDrawingEventListeners';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { DrawingMark } from '@/types/bodyMapperTypes';
import * as THREE from 'three';

interface ModelDrawingProps {
  isDrawing: boolean;
  drawingMarks: DrawingMark[];
  selectedColor: string;
  brushSize: number;
  drawingTarget: 'body' | 'whiteboard';
  mode: string;
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
  drawingTarget,
  mode,
  onAddMark,
  onStrokeStart,
  onStrokeComplete,
  onAddToStroke,
  modelRef 
}: ModelDrawingProps) => {
  console.log('🖊️ ModelDrawing received drawingMarks:', drawingMarks.length, 'marks with surfaces:', drawingMarks.map(m => ({id: m.id, surface: m.surface})));
  const drawingEvents = useDrawingEvents({
    isDrawing,
    selectedColor,
    brushSize,
    drawingTarget,
    mode,
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
