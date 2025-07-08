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
        className="relative w-full h-10 bg-muted rounded-full cursor-pointer overflow-hidden"
      >
        {/* Sliding background indicator */}
        <div 
          className={`absolute top-0 h-full w-1/2 bg-green-500 rounded-full transition-transform duration-200 ease-in-out ${
            drawingTarget === 'whiteboard' ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
        
        {/* Text labels */}
        <div className="relative flex h-full">
          <div className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
            drawingTarget === 'body' ? 'text-white' : 'text-muted-foreground'
          }`}>
            Body
          </div>
          <div className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
            drawingTarget === 'whiteboard' ? 'text-white' : 'text-muted-foreground'
          }`}>
            Whiteboard
          </div>
        </div>
      </div>
    </div>
  );
};