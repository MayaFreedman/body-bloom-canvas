import { useState, useCallback } from 'react';
import { WhiteboardMark } from '@/types/bodyMapperTypes';

interface UseWhiteboardStateProps {
  selectedColor: string;
  brushSize: number;
  onAddAction?: (action: any) => void;
}

export const useWhiteboardState = ({
  selectedColor,
  brushSize,
  onAddAction
}: UseWhiteboardStateProps) => {
  const [whiteboardMarks, setWhiteboardMarks] = useState<WhiteboardMark[]>([]);
  const [whiteboardBackground, setWhiteboardBackground] = useState('white');
  const [isDrawingOnWhiteboard, setIsDrawingOnWhiteboard] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  const addWhiteboardMark = useCallback((x: number, y: number) => {
    const mark: WhiteboardMark = {
      id: `whiteboard-mark-${Date.now()}-${Math.random()}`,
      x,
      y,
      color: selectedColor,
      size: brushSize / 200, // Convert to canvas size
      timestamp: Date.now()
    };

    setWhiteboardMarks(prev => [...prev, mark]);
    return mark;
  }, [selectedColor, brushSize]);

  const interpolateWhiteboardMarks = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const steps = Math.floor(distance / 2); // Create marks every 2 pixels

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      addWhiteboardMark(x, y);
    }
  }, [addWhiteboardMark]);

  const handleWhiteboardPointerDown = useCallback((x: number, y: number) => {
    setIsDrawingOnWhiteboard(true);
    setLastPosition({ x, y });
    addWhiteboardMark(x, y);
  }, [addWhiteboardMark]);

  const handleWhiteboardPointerMove = useCallback((x: number, y: number) => {
    if (!isDrawingOnWhiteboard || !lastPosition) return;

    // Interpolate between last position and current position
    interpolateWhiteboardMarks(lastPosition.x, lastPosition.y, x, y);
    addWhiteboardMark(x, y);
    setLastPosition({ x, y });
  }, [isDrawingOnWhiteboard, lastPosition, interpolateWhiteboardMarks, addWhiteboardMark]);

  const handleWhiteboardPointerUp = useCallback(() => {
    setIsDrawingOnWhiteboard(false);
    setLastPosition(null);
  }, []);

  const handleWhiteboardFill = useCallback((color: string) => {
    const previousColor = whiteboardBackground;
    setWhiteboardBackground(color);

    // Add to action history for undo/redo
    onAddAction?.({
      type: 'whiteboardFill',
      data: {
        newColor: color,
        previousColor: previousColor
      },
      metadata: {
        fillColor: color
      }
    });
  }, [whiteboardBackground, onAddAction]);

  const clearWhiteboardMarks = useCallback(() => {
    setWhiteboardMarks([]);
  }, []);

  const eraseWhiteboardMarks = useCallback((centerX: number, centerY: number, radius: number) => {
    setWhiteboardMarks(prev => 
      prev.filter(mark => {
        const distance = Math.sqrt((mark.x - centerX) ** 2 + (mark.y - centerY) ** 2);
        return distance > radius;
      })
    );
  }, []);

  return {
    whiteboardMarks,
    whiteboardBackground,
    setWhiteboardMarks,
    setWhiteboardBackground,
    addWhiteboardMark,
    handleWhiteboardPointerDown,
    handleWhiteboardPointerMove,
    handleWhiteboardPointerUp,
    handleWhiteboardFill,
    clearWhiteboardMarks,
    eraseWhiteboardMarks
  };
};