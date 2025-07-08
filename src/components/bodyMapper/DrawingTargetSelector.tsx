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
        className="relative h-6 w-20 bg-muted rounded-full cursor-pointer transition-colors duration-200 border border-border"
      >
        {/* Sliding thumb */}
        <div 
          className={`absolute top-0.5 h-5 w-5 bg-background rounded-full shadow-md transition-transform duration-200 ease-out border border-border ${
            drawingTarget === 'whiteboard' ? 'translate-x-[3.25rem]' : 'translate-x-0.5'
          }`}
        >
          {/* Green indicator dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
        
        {/* Hidden text for accessibility */}
        <span className="sr-only">
          {drawingTarget === 'body' ? 'Body selected' : 'Whiteboard selected'}
        </span>
      </div>
      
      {/* Current selection label */}
      <span className="text-sm text-muted-foreground min-w-[4rem]">
        {drawingTarget === 'body' ? 'Body' : 'Board'}
      </span>
    </div>
  );
};