import React from 'react';
import { useTextEvents } from '@/hooks/useTextEvents';
import { useTextEventListeners } from '@/hooks/useTextEventListeners';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface ModelTextProps {
  isTextMode: boolean;
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
  textToPlace: string;
  onAddTextMark: (position: THREE.Vector3, text: string, surface: 'body' | 'whiteboard', color: string) => TextMark;
  modelRef?: React.RefObject<THREE.Group>;
}

export const ModelText = ({ 
  isTextMode,
  selectedColor,
  drawingTarget,
  textToPlace,
  onAddTextMark,
  modelRef 
}: ModelTextProps) => {
  
  const textEvents = useTextEvents({
    isTextMode,
    selectedColor,
    drawingTarget,
    textToPlace,
    onAddTextMark,
    modelRef
  });

  useTextEventListeners({
    isTextMode,
    ...textEvents
  });

  return null;
};