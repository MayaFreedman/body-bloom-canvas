import React from 'react';
import { useThree } from '@react-three/fiber';

interface UseTextEventListenersProps {
  isTextMode: boolean;
  handlePointerDown: (event: PointerEvent) => void;
}

export const useTextEventListeners = ({
  isTextMode,
  handlePointerDown
}: UseTextEventListenersProps) => {
  const { gl } = useThree();

  React.useEffect(() => {
    if (isTextMode) {
      gl.domElement.addEventListener('pointerdown', handlePointerDown);
      
      return () => {
        gl.domElement.removeEventListener('pointerdown', handlePointerDown);
      };
    }
  }, [isTextMode, handlePointerDown, gl]);
};