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
    <div className="mb-4 p-3 bg-card rounded-lg border">
      <h3 className="text-sm font-medium mb-2 text-foreground">Drawing On:</h3>
      <div className="flex gap-1">
        <Button
          variant={drawingTarget === 'body' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTargetChange('body')}
          className="flex-1"
        >
          Body
        </Button>
        <Button
          variant={drawingTarget === 'whiteboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTargetChange('whiteboard')}
          className="flex-1"
        >
          Whiteboard
        </Button>
      </div>
    </div>
  );
};