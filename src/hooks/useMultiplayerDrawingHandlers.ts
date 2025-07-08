
import { useMultiplayer } from './useMultiplayer';
import { useEmotionHandlers } from './useEmotionHandlers';
import { useBodyPartHandlers } from './useBodyPartHandlers';
import { useStrokeHandlers } from './useStrokeHandlers';
import { useSensationHandlers } from './useSensationHandlers';
import { useResetHandlers } from './useResetHandlers';
import * as THREE from 'three';

interface UseMultiplayerDrawingHandlersProps {
  multiplayer: ReturnType<typeof useMultiplayer>;
  handleStartDrawing: () => void;
  handleFinishDrawing: () => void;
  baseHandleBodyPartClick: (partName: string, color: string) => void;
  restoreStroke: (stroke: any) => void;
  modelRef: React.RefObject<THREE.Group>;
  clearAll: () => void;
  selectedColor: string;
  brushSize: number[];
  addAction: (action: any) => void;
  setSelectedSensation?: (sensation: any) => void;
}

export const useMultiplayerDrawingHandlers = ({
  multiplayer,
  handleStartDrawing,
  handleFinishDrawing,
  baseHandleBodyPartClick,
  restoreStroke,
  modelRef,
  clearAll,
  selectedColor,
  brushSize,
  addAction,
  setSelectedSensation
}: UseMultiplayerDrawingHandlersProps) => {
  const emotionHandlers = useEmotionHandlers({ multiplayer });
  const bodyPartHandlers = useBodyPartHandlers({ multiplayer, baseHandleBodyPartClick });
  const strokeHandlers = useStrokeHandlers({
    multiplayer,
    handleStartDrawing,
    handleFinishDrawing,
    restoreStroke,
    modelRef,
    selectedColor,
    brushSize,
    addAction
  });
  const sensationHandlers = useSensationHandlers({ multiplayer });
  const resetHandlers = useResetHandlers({ multiplayer, clearAll, setSelectedSensation });

  return {
    ...emotionHandlers,
    ...bodyPartHandlers,
    ...strokeHandlers,
    ...sensationHandlers,
    ...resetHandlers
  };
};
