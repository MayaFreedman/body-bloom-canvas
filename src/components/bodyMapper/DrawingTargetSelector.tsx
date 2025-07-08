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
  return (
    <div className="flex bg-muted rounded-lg p-1">
      <button
        onClick={() => onTargetChange('body')}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          drawingTarget === 'body' 
            ? 'bg-green-500 text-white shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Body
      </button>
      <button
        onClick={() => onTargetChange('whiteboard')}
        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
          drawingTarget === 'whiteboard' 
            ? 'bg-green-500 text-white shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Whiteboard
      </button>
    </div>
  );
};