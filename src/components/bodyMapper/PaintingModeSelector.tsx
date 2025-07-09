
import React from 'react';
import { Brush, Palette, Eraser, Type } from 'lucide-react';
import { BodyMapperMode } from '@/types/bodyMapperTypes';
import { DrawingTargetSelector } from './DrawingTargetSelector';

interface PaintingModeSelectorProps {
  mode: BodyMapperMode;
  onModeChange: (mode: BodyMapperMode) => void;
  title?: string;
  drawingTarget?: 'body' | 'whiteboard';
  onDrawingTargetChange?: (target: 'body' | 'whiteboard') => void;
}

export const PaintingModeSelector = ({ 
  mode, 
  onModeChange, 
  title = "Painting Mode",
  drawingTarget,
  onDrawingTargetChange 
}: PaintingModeSelectorProps) => {
  return (
    <div className="mb-6">
      {/* Drawing target toggle above tools header */}
      {drawingTarget && onDrawingTargetChange && (
        <div className="mb-4">
          <h5 className="font-medium text-gray-700 mb-2 text-sm">Drawing On</h5>
          <DrawingTargetSelector
            drawingTarget={drawingTarget}
            onTargetChange={onDrawingTargetChange}
          />
        </div>
      )}
      
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      
      {/* Drawing tools */}
      <div className="flex gap-2">
        <button
          className={`game-button-primary flex items-center justify-center px-3 py-2 text-sm ${mode === 'draw' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('draw')}
        >
          Draw
        </button>
        <button
          className={`game-button-primary flex items-center justify-center px-3 py-2 text-sm ${mode === 'fill' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('fill')}
        >
          Fill
        </button>
        <button
          className={`game-button-primary flex items-center justify-center px-3 py-2 text-sm ${mode === 'erase' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('erase')}
        >
          Erase
        </button>
        <button
          className={`game-button-primary flex items-center justify-center px-3 py-2 text-sm ${mode === 'text' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('text')}
        >
          Text
        </button>
      </div>
    </div>
  );
};