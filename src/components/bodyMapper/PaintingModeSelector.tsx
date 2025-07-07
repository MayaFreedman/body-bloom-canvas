
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
    <div className="mb-4">
      <h4 className="font-medium text-sm mb-3 text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'draw' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onModeChange('draw')}
        >
          <Brush className="w-4 h-4" />
          Draw
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'fill' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onModeChange('fill')}
        >
          <Palette className="w-4 h-4" />
          Fill
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'erase' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onModeChange('erase')}
        >
          <Eraser className="w-4 h-4" />
          Erase
        </button>
        <button
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'text' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onModeChange('text')}
        >
          <Type className="w-4 h-4" />
          Text
        </button>
      </div>
    </div>
  );
};
