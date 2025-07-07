
import React from 'react';
import { useThree } from '@react-three/fiber';

interface UseDrawingEventListenersProps {
  isDrawing: boolean;
  drawingTarget?: 'body' | 'whiteboard';
  isActivelyDrawing?: boolean;
  handlePointerDown: (event: PointerEvent) => void;
  handlePointerMove: (event: PointerEvent) => void;
  handlePointerUp: () => void;
}

export const useDrawingEventListeners = ({
  isDrawing,
  drawingTarget = 'body',
  isActivelyDrawing = false,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp
}: UseDrawingEventListenersProps) => {
  const { gl } = useThree();

  React.useEffect(() => {
    if (isDrawing) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
      gl.domElement.addEventListener('pointerleave', handlePointerUp);
      
      // Only set crosshair cursor if we're not in a "restricted" state (whiteboard mode hovering body)
      const shouldShowCrosshair = !(drawingTarget === 'whiteboard' && !isActivelyDrawing);
      
      console.log('🎯 useDrawingEventListeners Debug:', {
        isDrawing,
        drawingTarget,
        isActivelyDrawing,
        shouldShowCrosshair,
        currentCursor: gl.domElement.style.cursor
      });
      
      if (shouldShowCrosshair) {
        console.log('🎯 useDrawingEventListeners: Setting crosshair cursor');
        gl.domElement.style.setProperty('cursor', 'crosshair', 'important');
      } else {
        console.log('🎯 useDrawingEventListeners: NOT setting crosshair (restricted state)');
      }
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
        gl.domElement.removeEventListener('pointerleave', handlePointerUp);
        if (shouldShowCrosshair) {
          console.log('🎯 useDrawingEventListeners: Cleanup - resetting cursor');
          gl.domElement.style.cursor = 'default';
        }
      };
    } else {
      console.log('🎯 useDrawingEventListeners: Not drawing - setting default cursor');
      gl.domElement.style.cursor = 'default';
    }
  }, [isDrawing, drawingTarget, isActivelyDrawing, handlePointerDown, handlePointerMove, handlePointerUp, gl]);
};
