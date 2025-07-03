
import * as THREE from 'three';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { useIntersectionUtils } from './useIntersectionUtils';
import { useDrawingMarks } from './useDrawingMarks';
import { useDrawingEventHandlers } from './useDrawingEventHandlers';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface UseDrawingEventsProps {
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
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
    onAddToStroke,
    modelRef,
    getBodyPartAtPosition: intersectionUtils.getBodyPartAtPosition
  });

  const eventHandlers = useDrawingEventHandlers({
    isDrawing,
    onStrokeStart,
    onStrokeComplete,
    getIntersectedObjects: intersectionUtils.getIntersectedObjects,
    addMarkAtPosition: drawingMarks.addMarkAtPosition,
    interpolateMarks: drawingMarks.interpolateMarks
  });

  return eventHandlers;
};
