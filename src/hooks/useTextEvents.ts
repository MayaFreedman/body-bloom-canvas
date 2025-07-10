import * as THREE from 'three';
import { TextMark } from '@/types/textTypes';
import { useIntersectionUtils } from './useIntersectionUtils';
import { useTextPlacement } from './useTextPlacement';
import { useTextEventHandlers } from './useTextEventHandlers';

interface UseTextEventsProps {
  isTextMode: boolean;
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
  textToPlace: string;
  onAddTextMark: (position: THREE.Vector3, text: string, surface: 'body' | 'whiteboard', color: string) => TextMark;
  modelRef?: React.RefObject<THREE.Group>;
}

export const useTextEvents = ({
  isTextMode,
  selectedColor,
  drawingTarget,
  textToPlace,
  onAddTextMark,
  modelRef
}: UseTextEventsProps) => {
  const intersectionUtils = useIntersectionUtils({ modelRef });
  
  const textPlacement = useTextPlacement({
    selectedColor,
    drawingTarget,
    textToPlace,
    onAddTextMark,
    modelRef,
    getBodyPartAtPosition: intersectionUtils.getBodyPartAtPosition
  });

  const eventHandlers = useTextEventHandlers({
    isTextMode,
    drawingTarget,
    getIntersectedObjects: intersectionUtils.getIntersectedObjects,
    placeTextAtPosition: textPlacement.placeTextAtPosition
  });

  return eventHandlers;
};