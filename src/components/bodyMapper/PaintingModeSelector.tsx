
import React from 'react';
import { Brush, Palette, Eraser } from 'lucide-react';
import { BodyMapperMode } from '@/types/bodyMapperTypes';

interface PaintingModeSelectorProps {
  mode: BodyMapperMode;
  onModeChange: (mode: BodyMapperMode) => void;
}

export const PaintingModeSelector = ({ mode, onModeChange }: PaintingModeSelectorProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">Painting Mode</h4>
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
      </div>
    </div>
  );
};
