import React from 'react';
import { Switch } from '@/components/ui/switch';
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
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">Drawing On:</label>
      <div className="flex items-center space-x-3">
        <span className={`text-sm ${drawingTarget === 'body' ? 'font-medium' : 'text-muted-foreground'}`}>
          Body
        </span>
        <Switch
          checked={drawingTarget === 'whiteboard'}
          onCheckedChange={(checked) => onTargetChange(checked ? 'whiteboard' : 'body')}
        />
        <span className={`text-sm ${drawingTarget === 'whiteboard' ? 'font-medium' : 'text-muted-foreground'}`}>
          Whiteboard
        </span>
      </div>
    </div>
  );
};