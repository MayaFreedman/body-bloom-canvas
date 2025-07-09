
import * as THREE from 'three';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { DrawingMark } from '@/types/bodyMapperTypes';
import { useIntersectionUtils } from './useIntersectionUtils';
import { useDrawingMarks } from './useDrawingMarks';
import { useDrawingEventHandlers } from './useDrawingEventHandlers';

interface UseDrawingEventsProps {
  isDrawing: boolean;
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

export const useDrawingEvents = ({
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
}: UseDrawingEventsProps) => {
  const intersectionUtils = useIntersectionUtils({ modelRef });
  
  const drawingMarks = useDrawingMarks({
    selectedColor,
    brushSize,
    onAddMark,
    modelRef,
    getBodyPartAtPosition: intersectionUtils.getBodyPartAtPosition
  });

  const eventHandlers = useDrawingEventHandlers({
    isDrawing,
    drawingTarget,
    mode,
    onStrokeStart,
    onStrokeComplete,
    onAddToStroke,
    getIntersectedObjects: intersectionUtils.getIntersectedObjects,
    addMarkAtPosition: drawingMarks.addMarkAtPosition,
    interpolateMarks: drawingMarks.interpolateMarks
  });

  return eventHandlers;
};
