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
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-foreground">Drawing On:</label>
      
      <div 
        onClick={toggleTarget}
        className={`relative h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 border-2 ${
          drawingTarget === 'whiteboard' 
            ? 'bg-primary border-primary' 
            : 'bg-muted border-input'
        }`}
      >
        {/* Sliding thumb */}
        <div 
          className={`absolute top-0.5 h-4 w-4 bg-background rounded-full shadow-lg transition-transform duration-200 ease-out border border-border ${
            drawingTarget === 'whiteboard' ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      
      {/* Current selection label */}
      <span className="text-sm text-muted-foreground min-w-[4rem]">
        {drawingTarget === 'body' ? 'Body' : 'Board'}
      </span>
    </div>
  );
};