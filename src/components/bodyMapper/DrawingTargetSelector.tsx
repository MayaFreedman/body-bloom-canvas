import React from 'react';
import { DrawingTarget } from '@/types/bodyMapperTypes';

interface DrawingTargetSelectorProps {
  drawingTarget: DrawingTarget;
  onTargetChange: (target: DrawingTarget) => void;
}

export const DrawingTargetSelector = ({ 
  drawingTarget, 
  onTargetChange 
}: DrawingTargetSelectorProps) => {
  const toggleTarget = () => {
    onTargetChange(drawingTarget === 'body' ? 'whiteboard' : 'body');
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium mb-2 block">Drawing On:</label>
      <div 
        onClick={toggleTarget}
        className="relative w-full h-8 bg-gray-200 border border-gray-300 rounded-full cursor-pointer overflow-hidden"
      >
        {/* Sliding thumb */}
        <div 
          className={`absolute top-0.5 h-7 w-7 bg-white border border-gray-200 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            drawingTarget === 'whiteboard' ? 'translate-x-[calc(100%-30px)] left-0.5' : 'translate-x-0 left-0.5'
          }`}
        />
        
        {/* Text labels */}
        <div className="relative flex h-full">
          <div className={`flex-1 flex items-center justify-center text-xs font-medium transition-colors duration-200 ${
            drawingTarget === 'body' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Body
          </div>
          <div className={`flex-1 flex items-center justify-center text-xs font-medium transition-colors duration-200 ${
            drawingTarget === 'whiteboard' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Whiteboard
          </div>
        </div>
      </div>
    </div>
  );
};