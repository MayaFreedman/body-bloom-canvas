
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
          max={30}
          min={3}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Size: {brushSize[0]}px</span>
          <div className="flex space-x-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm"
              onClick={() => onBrushSizeChange([Math.max(3, brushSize[0] - 2)])}
            >
              -
            </button>
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm"
              onClick={() => onBrushSizeChange([Math.min(30, brushSize[0] + 2)])}
            >
              +
            </button>
          </div>
        </div>
        {/* Visual size indicator */}
        <div className="flex justify-center">
          <div 
            className="rounded-full border-2 border-gray-300"
            style={{ 
              width: `${brushSize[0]}px`, 
              height: `${brushSize[0]}px`,
              backgroundColor: selectedColor + '50'
            }}
          />
        </div>
      </div>
    </div>
  );
};
