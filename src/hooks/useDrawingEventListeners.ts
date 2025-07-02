
import React from 'react';
import { useThree } from '@react-three/fiber';

interface UseDrawingEventListenersProps {
  isDrawing: boolean;
  handlePointerDown: (event: PointerEvent) => void;
  handlePointerMove: (event: PointerEvent) => void;
  handlePointerUp: () => void;
}

export const useDrawingEventListeners = ({
  isDrawing,
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
      
      gl.domElement.style.cursor = 'crosshair';
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
        gl.domElement.removeEventListener('pointermove', handlePointerMove);
        gl.domElement.removeEventListener('pointerup', handlePointerUp);
        gl.domElement.removeEventListener('pointerleave', handlePointerUp);
        gl.domElement.style.cursor = 'default';
      };
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [isDrawing, handlePointerDown, handlePointerMove, handlePointerUp, gl]);
};
