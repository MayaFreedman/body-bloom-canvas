
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
      <div className="flex space-x-2">
        <button
          className={`game-button-primary ${mode === 'draw' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('draw')}
        >
          <Brush className="w-4 h-4 mr-2" />
          Draw Mode
        </button>
        <button
          className={`game-button-primary ${mode === 'fill' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('fill')}
        >
          <Palette className="w-4 h-4 mr-2" />
          Fill Mode
        </button>
        <button
          className={`game-button-primary ${mode === 'erase' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('erase')}
        >
          <Eraser className="w-4 h-4 mr-2" />
          Erase Mode
        </button>
        <button
          className={`game-button-primary ${mode === 'text' ? 'opacity-100' : 'opacity-70'}`}
          onClick={() => onModeChange('text')}
        >
          <Type className="w-4 h-4 mr-2" />
          Text Mode
        </button>
      </div>
    </div>
  );
};
