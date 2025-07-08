
import { useCallback } from 'react';
import { DrawingMark } from '@/types/bodyMapperTypes';
import { useStrokeManager } from './useStrokeManager';
import { useActionHistory } from './useActionHistory';

interface UseDrawingOperationsProps {
  strokeManager: ReturnType<typeof useStrokeManager>;
  actionHistory: ReturnType<typeof useActionHistory>;
  brushSize: number[];
  selectedColor: string;
}

export const useDrawingOperations = ({
  strokeManager,
  actionHistory,
  brushSize,
  selectedColor
}: UseDrawingOperationsProps) => {
  const handleStartDrawing = useCallback(() => {
    const strokeId = strokeManager.startStroke(brushSize[0], selectedColor);
    return strokeId;
  }, [strokeManager, brushSize, selectedColor]);

  const handleAddDrawingMark = useCallback((mark: Omit<DrawingMark, 'strokeId' | 'timestamp' | 'userId'>) => {
    const enhancedMark = strokeManager.addMarkToStroke(mark);
    return enhancedMark;
  }, [strokeManager]);

  const handleFinishDrawing = useCallback(() => {
    const completedStroke = strokeManager.finishStroke();
    
    if (completedStroke) {
      actionHistory.addAction({
        type: 'draw',
        data: {
          strokes: [completedStroke]
        },
        metadata: {
          brushSize: completedStroke.brushSize,
          color: completedStroke.color
        }
      });
    }
    
    return completedStroke;
  }, [strokeManager, actionHistory]);

  return {
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing
  };
};
