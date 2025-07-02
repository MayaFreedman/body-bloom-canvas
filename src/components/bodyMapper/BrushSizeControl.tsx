
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface BrushSizeControlProps {
  brushSize: number[];
  selectedColor: string;
  onBrushSizeChange: (size: number[]) => void;
}

export const BrushSizeControl = ({ brushSize, selectedColor, onBrushSizeChange }: BrushSizeControlProps) => {
  // Calculate actual visual size based on proper 3D-to-screen projection
  // The 3D drawing uses brushSize / 100 as the radius in 3D space
  // Camera settings: FOV = 50°, distance ≈ 5 units, canvas ≈ 800px wide
  const threeDRadius = brushSize[0] / 100; // Convert brush size to 3D radius
  const cameraDistance = 5; // Typical camera distance from model
  const fovRadians = (50 * Math.PI) / 180; // 50° FOV in radians
  const canvasWidth = 800; // Approximate canvas width
  
  // Project 3D radius to screen pixels
  // Formula: screenSize = (3D_radius / (distance * tan(fov/2))) * (canvasWidth / 2)
  const projectedRadius = (threeDRadius / (cameraDistance * Math.tan(fovRadians / 2))) * (canvasWidth / 2);
  const actualVisualSize = Math.max(2, Math.min(60, projectedRadius));

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
          <span className="text-sm text-gray-600">Size: {brushSize[0]}</span>
          <div className="flex space-x-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
              onClick={() => onBrushSizeChange([Math.max(3, brushSize[0] - 2)])}
            >
              -
            </button>
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
              onClick={() => onBrushSizeChange([Math.min(30, brushSize[0] + 2)])}
            >
              +
            </button>
          </div>
        </div>
        {/* Visual size indicator that matches actual drawing size */}
        <div className="flex justify-center">
          <div 
            className="rounded-full border-2 border-gray-300"
            style={{ 
              width: `${actualVisualSize}px`, 
              height: `${actualVisualSize}px`,
              backgroundColor: selectedColor + '50'
            }}
          />
        </div>
        <div className="text-xs text-gray-500 text-center">
          Preview shows actual drawing size
        </div>
      </div>
    </div>
  );
};
