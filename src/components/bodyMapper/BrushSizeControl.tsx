
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface BrushSizeControlProps {
  brushSize: number[];
  selectedColor: string;
  onBrushSizeChange: (size: number[]) => void;
}

export const BrushSizeControl = ({ brushSize, selectedColor, onBrushSizeChange }: BrushSizeControlProps) => {
  return (
    <div>
      <h5 className="font-medium text-gray-700 mb-3 text-sm">Brush Size</h5>
      <div className="space-y-3">
        <Slider
          value={brushSize}
          onValueChange={onBrushSizeChange}
          max={20}
          min={3}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-center">
          <span className="text-sm text-gray-600">Size: {brushSize[0]}</span>
        </div>
      </div>
    </div>
  );
};
