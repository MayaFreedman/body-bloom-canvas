import React, { useRef, useEffect, useCallback, useState } from 'react';

interface WhiteboardMark {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface WhiteboardOverlayProps {
  visible: boolean;
  backgroundColor: string;
  marks: WhiteboardMark[];
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
  onAddMark: (mark: WhiteboardMark) => void;
  onStrokeStart?: () => void;
  onStrokeComplete?: () => void;
  onFill?: (color: string) => void;
}

export const WhiteboardOverlay = ({
  visible,
  backgroundColor,
  marks,
  isDrawing,
  selectedColor,
  brushSize,
  onAddMark,
  onStrokeStart,
  onStrokeComplete,
  onFill
}: WhiteboardOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  // Draw all marks on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all marks
    marks.forEach(mark => {
      ctx.fillStyle = mark.color;
      ctx.beginPath();
      ctx.arc(mark.x, mark.y, mark.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [marks, backgroundColor]);

  // Redraw when marks or background changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getMousePosition = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawing) {
      // Handle fill click
      if (onFill) {
        onFill(selectedColor);
      }
      return;
    }

    const pos = getMousePosition(e);
    if (!pos) return;

    setIsMouseDown(true);
    setLastPosition(pos);
    
    if (onStrokeStart) {
      onStrokeStart();
    }

    // Add first mark
    const mark: WhiteboardMark = {
      id: `whiteboard-mark-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      color: selectedColor,
      size: brushSize / 8 // Convert brush size to appropriate canvas size
    };
    onAddMark(mark);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !isMouseDown) return;

    const pos = getMousePosition(e);
    if (!pos || !lastPosition) return;

    // Add mark at current position
    const mark: WhiteboardMark = {
      id: `whiteboard-mark-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      color: selectedColor,
      size: brushSize / 8
    };
    onAddMark(mark);

    // Interpolate between last and current position for smooth lines
    const distance = Math.sqrt(
      Math.pow(pos.x - lastPosition.x, 2) + Math.pow(pos.y - lastPosition.y, 2)
    );
    
    const steps = Math.ceil(distance / 2);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const interpolatedMark: WhiteboardMark = {
        id: `whiteboard-mark-${Date.now()}-${Math.random()}-${i}`,
        x: lastPosition.x + (pos.x - lastPosition.x) * t,
        y: lastPosition.y + (pos.y - lastPosition.y) * t,
        color: selectedColor,
        size: brushSize / 8
      };
      onAddMark(interpolatedMark);
    }

    setLastPosition(pos);
  };

  const handleMouseUp = () => {
    if (isMouseDown && onStrokeComplete) {
      onStrokeComplete();
    }
    setIsMouseDown(false);
    setLastPosition(null);
  };

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-crosshair"
        style={{ backgroundColor: backgroundColor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};