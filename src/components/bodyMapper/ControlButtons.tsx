
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
        onMouseEnter={() => {
          console.log('🎯 Reset container mouse enter');
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          console.log('🎯 Reset container mouse leave');
          onControlButtonsHover?.(false);
        }}
      >
        <Tooltip onOpenChange={(open) => console.log('🚨 Reset Tooltip open state:', open)}>
          <TooltipTrigger asChild>
            <button 
              onClick={handleResetAll} 
              className="main-reset-button"
              aria-label="Reset all changes to the body model"
              onMouseEnter={() => console.log('🔥 Reset button hover enter')}
              onMouseLeave={() => console.log('🔥 Reset button hover leave')}
            >
              Reset All Changes
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="z-[9999]"
            onPointerEnter={() => console.log('💡 Reset tooltip pointer enter')}
            onPointerLeave={() => console.log('💡 Reset tooltip pointer leave')}
          >
            <p>Reset</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Undo/Redo Container */}
      <div 
        className="undo-redo-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => {
          console.log('🎯 Undo/Redo container mouse enter');
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          console.log('🎯 Undo/Redo container mouse leave');
          onControlButtonsHover?.(false);
        }}
      >
        <Tooltip 
          onOpenChange={(open) => console.log('🚨 Undo Tooltip open state:', open)}
          delayDuration={0}
        >
          <TooltipTrigger asChild>
            <button 
              onClick={handleUndo}
              disabled={!canUndo}
              className={`control-button ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              onMouseEnter={() => console.log('🔥 Undo button hover enter, canUndo:', canUndo)}
              onMouseLeave={() => console.log('🔥 Undo button hover leave')}
            >
              <Undo2 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="z-[9999] bg-gray-800 text-white pointer-events-none"
            sideOffset={10}
          >
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip 
          onOpenChange={(open) => console.log('🚨 Redo Tooltip open state:', open)}
          delayDuration={0}
        >
          <TooltipTrigger asChild>
            <button 
              onClick={handleRedo}
              disabled={!canRedo}
              className={`control-button ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              onMouseEnter={() => console.log('🔥 Redo button hover enter, canRedo:', canRedo)}
              onMouseLeave={() => console.log('🔥 Redo button hover leave')}
            >
              <Redo2 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="z-[9999] bg-gray-800 text-white pointer-events-none"
            sideOffset={10}
          >
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip 
          onOpenChange={(open) => console.log('🚨 Snapshot Tooltip open state:', open)}
          delayDuration={0}
        >
          <TooltipTrigger asChild>
            <button 
              onClick={captureScreenshot} 
              className="control-button"
              onMouseEnter={() => console.log('🔥 Snapshot button hover enter')}
              onMouseLeave={() => console.log('🔥 Snapshot button hover leave')}
            >
              <Camera size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="z-[9999] bg-gray-800 text-white pointer-events-none"
            sideOffset={10}
          >
            <p>Snapshot</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
