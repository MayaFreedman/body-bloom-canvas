
import React from 'react';
import html2canvas from 'html2canvas';

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
  isActivelyDrawing = false
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
      {/* Reset Button Container - Bottom Center */}
      <div 
        className="reset-button-container control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
      >
        <button 
          onClick={handleResetAll} 
          className="main-reset-button"
          aria-label="Reset all changes to the body model" 
          title="Click to reset all changes"
        >
          Reset All Changes
        </button>
      </div>

      {/* Undo/Redo Container - Top Left */}
      <div 
        className="top-left-controls control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
      >
        <button 
          onClick={handleUndo}
          disabled={!canUndo}
          className={`control-button ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Undo last action"
        >
          ↩ Undo
        </button>
        <button 
          onClick={handleRedo}
          disabled={!canRedo}
          className={`control-button ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Redo last undone action"
        >
          ↪ Redo
        </button>
      </div>

      {/* Snapshot Button - Top Right */}
      <div 
        className="top-right-controls control-buttons"
        style={{ pointerEvents: shouldDisablePointerEvents ? 'none' : 'auto' }}
      >
        <button onClick={captureScreenshot} className="control-button">
          📷 Snapshot
        </button>
      </div>
    </>
  );
};
