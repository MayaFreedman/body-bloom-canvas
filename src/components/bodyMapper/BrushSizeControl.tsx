
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
      <h5 className="font-medium text-gray-800 text-[16px] mb-3">Brush Size</h5>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Slider
            value={brushSize}
            onValueChange={onBrushSizeChange}
            max={20}
            min={3}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 font-medium min-w-[40px] text-right">{brushSize[0]}px</span>
        </div>
      </div>
    </div>
  );
};
