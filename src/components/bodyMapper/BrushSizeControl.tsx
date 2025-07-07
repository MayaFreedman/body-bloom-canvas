
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
      <h4 className="font-semibold text-gray-800 mb-3">Brush Size</h4>
      <div className="space-y-3">
        <Slider
          value={brushSize}
          onValueChange={onBrushSizeChange}
          max={20}
          min={3}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Size: {brushSize[0]}</span>
          <div className="flex space-x-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
              onClick={() => onBrushSizeChange([Math.max(3, brushSize[0] - 1)])}
            >
              -
            </button>
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
              onClick={() => onBrushSizeChange([Math.min(20, brushSize[0] + 1)])}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
