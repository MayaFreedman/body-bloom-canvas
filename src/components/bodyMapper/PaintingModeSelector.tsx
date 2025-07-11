
import React, { useState } from 'react';
import { Brush, Palette, Eraser, Type, Trash2 } from 'lucide-react';
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

  // Reset clearFillMode when switching away from fill mode
  React.useEffect(() => {
    if (mode !== 'fill') {
      setClearFillMode(false);
      onClearFillModeChange?.(false);
    }
  }, [mode, onClearFillModeChange]);
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
          onClick={() => {
            if (mode === 'fill' && clearFillMode) {
              handleClearFillModeChange(false);
            } else {
              onModeChange('fill');
            }
          }}
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
        <div className="mt-4 mb-1">
          <h5 className="font-medium text-gray-800 text-[16px] mb-3">Fill Eraser</h5>
          <div className="flex items-center">
            <p className="text-sm text-gray-500 text-left w-1/2">
              Click on body parts or whiteboard to remove color
            </p>
            <div className="w-1/2 flex justify-start">
              <button
                className={`control-button-with-text-red w-full h-10 flex items-center justify-center ${
                  clearFillMode ? 'bg-red-500 text-white border-red-500' : ''
                }`}
                onClick={() => handleClearFillModeChange(!clearFillMode)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};