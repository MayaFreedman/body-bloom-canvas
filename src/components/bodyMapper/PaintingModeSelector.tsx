
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
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      
      {/* Drawing target toggle above tools */}
      {drawingTarget && onDrawingTargetChange && (
        <div className="mb-3">
          <DrawingTargetSelector
            drawingTarget={drawingTarget}
            onTargetChange={onDrawingTargetChange}
          />
        </div>
      )}
      
      {/* Drawing tools */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`game-button-primary flex items-center justify-center gap-2 px-3 py-2 text-sm ${mode === 'draw' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('draw')}
        >
          <Brush className="w-4 h-4" />
          Draw
        </button>
        <button
          className={`game-button-primary flex items-center justify-center gap-2 px-3 py-2 text-sm ${mode === 'fill' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('fill')}
        >
          <Palette className="w-4 h-4" />
          Fill
        </button>
        <button
          className={`game-button-primary flex items-center justify-center gap-2 px-3 py-2 text-sm ${mode === 'erase' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('erase')}
        >
          <Eraser className="w-4 h-4" />
          Erase
        </button>
        <button
          className={`game-button-primary flex items-center justify-center gap-2 px-3 py-2 text-sm ${mode === 'text' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('text')}
        >
          <Type className="w-4 h-4" />
          Text
        </button>
      </div>
    </div>
  );
};