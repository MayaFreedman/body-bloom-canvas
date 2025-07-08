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
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">Drawing On:</label>
      <div 
        onClick={toggleTarget}
        className="relative w-24 h-6 bg-gray-200 border border-gray-300 rounded-full cursor-pointer overflow-hidden"
      >
        {/* Sliding orb */}
        <div 
          className={`absolute top-0.5 h-5 w-5 bg-white border border-gray-200 rounded-full shadow-sm transition-transform duration-200 ease-in-out flex items-center justify-center ${
            drawingTarget === 'whiteboard' ? 'translate-x-[calc(100%-20px)] left-0.5' : 'translate-x-0 left-0.5'
          }`}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
        </div>
        
        {/* Text labels */}
        <div className="relative flex h-full">
          <div className={`flex-1 flex items-center justify-center text-[10px] font-medium transition-colors duration-200 ${
            drawingTarget === 'body' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Body
          </div>
          <div className={`flex-1 flex items-center justify-center text-[10px] font-medium transition-colors duration-200 ${
            drawingTarget === 'whiteboard' ? 'text-green-600' : 'text-gray-500'
          }`}>
            Board
          </div>
        </div>
      </div>
    </div>
  );
};