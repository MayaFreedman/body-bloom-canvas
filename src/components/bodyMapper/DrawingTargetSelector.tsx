import React from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="flex gap-2">
      <Button
        variant={drawingTarget === 'body' ? 'navy' : 'outline'}
        size="sm"
        onClick={() => onTargetChange('body')}
        className="flex-1"
      >
        Body
      </Button>
      <Button
        variant={drawingTarget === 'whiteboard' ? 'navy' : 'outline'}
        size="sm"
        onClick={() => onTargetChange('whiteboard')}
        className="flex-1"
      >
        Whiteboard
      </Button>
    </div>
  );
};