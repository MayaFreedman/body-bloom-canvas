
import React, { useState } from 'react';
import { Brush, Palette, Eraser, Type } from 'lucide-react';
import { BodyMapperMode } from '@/types/bodyMapperTypes';
import { DrawingTargetSelector } from './DrawingTargetSelector';

interface PaintingModeSelectorProps {
  mode: BodyMapperMode;
  onModeChange: (mode: BodyMapperMode) => void;
  title?: string;
  drawingTarget?: 'body' | 'whiteboard';
  onDrawingTargetChange?: (target: 'body' | 'whiteboard') => void;
  onBodyPartClick?: (partName: string, color: string) => void;
  selectedColor?: string;
  onClearFillModeChange?: (clearFillMode: boolean) => void;
}

export const PaintingModeSelector = ({ 
  mode, 
  onModeChange, 
  title = "Painting Mode",
  drawingTarget,
  onDrawingTargetChange,
  onBodyPartClick,
  selectedColor = '#ff6b6b',
  onClearFillModeChange
}: PaintingModeSelectorProps) => {
  const [clearFillMode, setClearFillMode] = useState(false);
  
  const handleClearFillModeChange = (newClearFillMode: boolean) => {
    setClearFillMode(newClearFillMode);
    onClearFillModeChange?.(newClearFillMode);
  };
  return (
    <div className="mb-6">
      {/* Drawing target toggle above tools header */}
      {drawingTarget && onDrawingTargetChange && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-800">Drawing On:</h4>
            <DrawingTargetSelector
              drawingTarget={drawingTarget}
              onTargetChange={onDrawingTargetChange}
            />
          </div>
        </div>
      )}
      
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      
      {/* Drawing tools */}
      <div className="flex gap-2">
        <button
          className={`game-button-primary flex-1 flex items-center justify-center px-3 py-2 text-sm ${mode === 'draw' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('draw')}
        >
          Draw
        </button>
        <button
          className={`game-button-primary flex-1 flex items-center justify-center px-3 py-2 text-sm ${mode === 'fill' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('fill')}
        >
          Fill
        </button>
        <button
          className={`game-button-primary flex-1 flex items-center justify-center px-3 py-2 text-sm ${mode === 'erase' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('erase')}
        >
          Erase
        </button>
        <button
          className={`game-button-primary flex-1 flex items-center justify-center px-3 py-2 text-sm ${mode === 'text' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('text')}
        >
          Text
        </button>
      </div>
      
      {/* Clear Fill sub-option for Fill mode */}
      {mode === 'fill' && (
        <div className="mt-4 flex flex-col items-start">
          <button
            className={`control-button-with-text-red ${
              clearFillMode ? 'bg-red-500 text-white border-red-500' : ''
            }`}
            onClick={() => handleClearFillModeChange(!clearFillMode)}
          >
            Clear Fill
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Click on body parts or whiteboard to remove color
          </p>
        </div>
      )}
    </div>
  );
};