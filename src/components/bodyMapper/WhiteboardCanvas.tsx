import React, { useRef, useEffect, useCallback } from 'react';
import { WhiteboardMark } from '@/types/bodyMapperTypes';

interface WhiteboardCanvasProps {
  visible: boolean;
  backgroundColor: string;
  marks: WhiteboardMark[];
  onPointerDown?: (x: number, y: number) => void;
  onPointerMove?: (x: number, y: number) => void;
  onPointerUp?: () => void;
  isDrawing?: boolean;
  drawingTarget?: 'body' | 'whiteboard';
}

export const WhiteboardCanvas = ({
  visible,
  backgroundColor,
  marks,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  isDrawing = false,
  drawingTarget = 'body'
}: WhiteboardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerDown = useRef(false);

  // Draw all marks on the canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all marks
    marks.forEach(mark => {
      ctx.fillStyle = mark.color;
      ctx.beginPath();
      ctx.arc(mark.x, mark.y, mark.size * 100, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [backgroundColor, marks]);

  // Redraw when marks or background change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || drawingTarget !== 'whiteboard') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDown.current = true;
    onPointerDown?.(x, y);
  }, [isDrawing, drawingTarget, onPointerDown]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || drawingTarget !== 'whiteboard' || !isPointerDown.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onPointerMove?.(x, y);
  }, [isDrawing, drawingTarget, onPointerMove]);

  const handlePointerUp = useCallback(() => {
    if (isPointerDown.current) {
      isPointerDown.current = false;
      onPointerUp?.();
    }
  }, [onPointerUp]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ 
        zIndex: drawingTarget === 'whiteboard' ? 10 : 5,
        cursor: isDrawing && drawingTarget === 'whiteboard' ? 'crosshair' : 'default'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};