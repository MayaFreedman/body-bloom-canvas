import React from 'react';
import { Undo2, Redo2, Camera } from 'lucide-react';
import { ScreenshotCaptureHandle } from './ScreenshotCapture';
import { ScreenshotComposer } from './ScreenshotComposer';
import { SensationMark } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

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
  screenshotRef?: React.RefObject<ScreenshotCaptureHandle>;
  emotions?: CustomEmotion[];
  sensationMarks?: SensationMark[];
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
  screenshotRef,
  emotions = [],
  sensationMarks = []
}: ControlButtonsProps) => {
  // Enhanced screenshot functionality with legend
  const screenshotComposer = screenshotRef ? ScreenshotComposer({
    screenshotCaptureRef: screenshotRef,
    emotions,
    sensationMarks
  }) : null;

  const captureScreenshot = async () => {
    try {
      if (!screenshotRef?.current || !screenshotComposer) {
        return;
      }

      // Generate the composite screenshot with legend
      const screenshotDataUrl = await screenshotComposer.generateScreenshot();
      
      // Convert to blob and download
      const response = await fetch(screenshotDataUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `body-map-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
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
        onMouseEnter={() => {
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          onControlButtonsHover?.(false);
        }}
      >
        <button 
          onClick={handleResetAll} 
          className="control-button-with-text-red"
          aria-label="Reset all changes to the body model"
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          Reset
        </button>
      </div>

      {/* Undo/Redo Container */}
      <div 
        className="undo-redo-container-top-left control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => {
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          onControlButtonsHover?.(false);
        }}
      >
        <button 
          onClick={handleUndo}
          disabled={!canUndo}
          className={`control-button-with-text ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <Undo2 size={16} />
          <span className="ml-2">Undo</span>
        </button>
        
        <button 
          onClick={handleRedo}
          disabled={!canRedo}
          className={`control-button-with-text ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <Redo2 size={16} />
          <span className="ml-2">Redo</span>
        </button>
      </div>

      {/* Snapshot Button Container - Below Body */}
      <div 
        className="snapshot-button-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
        onMouseEnter={() => {
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          onControlButtonsHover?.(false);
        }}
      >
        <button 
          onClick={captureScreenshot} 
          className="main-snapshot-button"
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <Camera size={20} className="mr-2" />
          Snapshot
        </button>
      </div>
    </>
  );
};