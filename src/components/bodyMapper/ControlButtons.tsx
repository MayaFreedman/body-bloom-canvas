
import React from 'react';
import html2canvas from 'html2canvas';
import { Undo2, Redo2, Camera } from 'lucide-react';

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
  onCaptureScreenshot?: () => void;
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
  onControlButtonsHover,
  onCaptureScreenshot
}: ControlButtonsProps) => {
  const captureScreenshot = () => {
    console.log('🎬 ControlButtons: Screenshot button clicked');
    console.log('🎬 ControlButtons: onCaptureScreenshot exists:', !!onCaptureScreenshot);
    if (onCaptureScreenshot) {
      console.log('🎬 ControlButtons: Calling onCaptureScreenshot');
      onCaptureScreenshot();
    } else {
      console.warn('🎬 ControlButtons: Screenshot function not provided');
    }
  };

  const handleUndo = () => {
    if (onUndo && canUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    if (onRedo && canRedo) {
      onRedo();
    }
  };

  const handleResetAll = () => {
    onResetAll();
  };

  // Only disable pointer events when actively drawing a stroke on whiteboard
  const shouldDisablePointerEvents = drawingTarget === 'whiteboard' && mode === 'draw' && isActivelyDrawing;

  return (
    <>
      {/* Reset Button Container */}
      <div 
        className="reset-button-container-top-right control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => onControlButtonsHover?.(true)}
        onMouseLeave={() => onControlButtonsHover?.(false)}
      >
        <button 
          onClick={handleResetAll} 
          className="control-button-with-text-red"
          aria-label="Reset all changes to the body model"
        >
          Reset
        </button>
      </div>

      {/* Undo/Redo Container */}
      <div 
        className="undo-redo-container-top-left control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => onControlButtonsHover?.(true)}
        onMouseLeave={() => onControlButtonsHover?.(false)}
      >
        <button 
          onClick={handleUndo}
          disabled={!canUndo}
          className={`control-button-with-text ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <Undo2 size={16} />
          <span className="ml-2">Undo</span>
        </button>
        
        <button 
          onClick={handleRedo}
          disabled={!canRedo}
          className={`control-button-with-text ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <Redo2 size={16} />
          <span className="ml-2">Redo</span>
        </button>
      </div>

      {/* Snapshot Button Container - Below Body */}
      <div 
        className="snapshot-button-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => onControlButtonsHover?.(true)}
        onMouseLeave={() => onControlButtonsHover?.(false)}
      >
        <button 
          onClick={captureScreenshot} 
          className="main-snapshot-button"
        >
          <Camera size={20} className="mr-2" />
          Snapshot
        </button>
      </div>
    </>
  );
};
