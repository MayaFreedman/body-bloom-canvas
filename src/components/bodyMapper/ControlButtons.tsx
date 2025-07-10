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
      console.log('📸 Starting enhanced screenshot capture...');
      
      if (!screenshotRef?.current || !screenshotComposer) {
        console.error('❌ Screenshot capture ref is not available');
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
      
      console.log('✅ Enhanced screenshot downloaded successfully');
    } catch (error) {
      console.error('❌ Enhanced screenshot capture failed:', error);
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
        className="reset-button-container-top-right control-buttons"
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
        <button 
          onClick={handleResetAll} 
          className="control-button-with-text-red"
          aria-label="Reset all changes to the body model"
          onMouseEnter={() => console.log('🔥 Reset button hover enter')}
          onMouseLeave={() => console.log('🔥 Reset button hover leave')}
        >
          Reset
        </button>
      </div>

      {/* Undo/Redo Container */}
      <div 
        className="undo-redo-container-top-left control-buttons"
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
        <button 
          onClick={handleUndo}
          disabled={!canUndo}
          className={`control-button-with-text ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onMouseEnter={() => console.log('🔥 Undo button hover enter, canUndo:', canUndo)}
          onMouseLeave={() => console.log('🔥 Undo button hover leave')}
        >
          <Undo2 size={16} />
          <span className="ml-2">Undo</span>
        </button>
        
        <button 
          onClick={handleRedo}
          disabled={!canRedo}
          className={`control-button-with-text ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onMouseEnter={() => console.log('🔥 Redo button hover enter, canRedo:', canRedo)}
          onMouseLeave={() => console.log('🔥 Redo button hover leave')}
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
          console.log('🎯 Snapshot container mouse enter');
          onControlButtonsHover?.(true);
        }}
        onMouseLeave={() => {
          console.log('🎯 Snapshot container mouse leave');
          onControlButtonsHover?.(false);
        }}
      >
        <button 
          onClick={captureScreenshot} 
          className="main-snapshot-button"
          onMouseEnter={() => console.log('🔥 Snapshot button hover enter')}
          onMouseLeave={() => console.log('🔥 Snapshot button hover leave')}
        >
          <Camera size={20} className="mr-2" />
          Snapshot
        </button>
      </div>
    </>
  );
};