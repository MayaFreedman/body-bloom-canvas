
import React from 'react';
import { useEraserInteractions } from '@/hooks/useEraserInteractions';
import { useEraserEventListeners } from '@/hooks/useEraserEventListeners';
import { useIntersectionUtils } from '@/hooks/useIntersectionUtils';
import * as THREE from 'three';

interface ModelEraserProps {
  isErasing: boolean;
  eraserRadius: number;
  onErase: (center: THREE.Vector3, radius: number) => void;
  modelRef?: React.RefObject<THREE.Group>;
}

export const ModelEraser = ({ 
  isErasing, 
  eraserRadius, 
  onErase,
  modelRef 
}: ModelEraserProps) => {
  const intersectionUtils = useIntersectionUtils({ modelRef });
  
  const eraserInteractions = useEraserInteractions({
    isErasing,
    eraserRadius,
    onErase,
    getIntersectedObjects: intersectionUtils.getIntersectedObjects
  });

  useEraserEventListeners({
    isErasing,
    ...eraserInteractions
  });

  return null;
};
