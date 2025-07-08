
import React from 'react';
import html2canvas from 'html2canvas';
import { Undo2, Redo2, Camera } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ControlButtonsProps {
  onResetAll: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  drawingTarget?: 'body' | 'whiteboard';
  mode?: string;
  isActivelyDrawing?: boolean;
  onControlButtonsHover?: (isHovering: boolean) => void;
}

export const ControlButtons = ({ 
  onResetAll, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false, 
  canvasRef,
  drawingTarget = 'body',
  mode = 'draw',
  isActivelyDrawing = false,
  onControlButtonsHover
}: ControlButtonsProps) => {
  const captureScreenshot = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#f8f9fa',
        useCORS: true,
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `emotional-body-map-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  const handleUndo = () => {
    console.log('Undo clicked, canUndo:', canUndo);
    if (onUndo && canUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    console.log('Redo clicked, canRedo:', canRedo);
    if (onRedo && canRedo) {
      onRedo();
    }
  };

  const handleResetAll = () => {
    console.log('YAY!');
    onResetAll();
  };

  // Only disable pointer events when actively drawing a stroke on whiteboard
  const shouldDisablePointerEvents = drawingTarget === 'whiteboard' && mode === 'draw' && isActivelyDrawing;

  return (
    <>
      {/* Reset Button Container */}
      <div 
        className="reset-button-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => onControlButtonsHover?.(true)}
        onMouseLeave={() => onControlButtonsHover?.(false)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleResetAll} 
              className="main-reset-button"
              aria-label="Reset all changes to the body model"
            >
              Reset All Changes
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-[9999]">
            <p>Reset</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Undo/Redo Container */}
      <div 
        className="undo-redo-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => onControlButtonsHover?.(true)}
        onMouseLeave={() => onControlButtonsHover?.(false)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleUndo}
              disabled={!canUndo}
              className={`control-button ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <Undo2 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-[9999]">
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleRedo}
              disabled={!canRedo}
              className={`control-button ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <Redo2 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-[9999]">
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={captureScreenshot} 
              className="control-button"
            >
              <Camera size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-[9999]">
            <p>Snapshot</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
