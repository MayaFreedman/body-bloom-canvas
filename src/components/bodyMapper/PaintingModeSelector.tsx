
import React from 'react';
import { Brush, Palette, Eraser, Type } from 'lucide-react';
import { BodyMapperMode } from '@/types/bodyMapperTypes';

interface PaintingModeSelectorProps {
  mode: BodyMapperMode;
  onModeChange: (mode: BodyMapperMode) => void;
  title?: string;
}

export const PaintingModeSelector = ({ mode, onModeChange, title = "Painting Mode" }: PaintingModeSelectorProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
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
