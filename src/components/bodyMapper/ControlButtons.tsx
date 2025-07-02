
import React from 'react';
import html2canvas from 'html2canvas';

interface ControlButtonsProps {
  onResetAll: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const ControlButtons = ({ onResetAll, canvasRef }: ControlButtonsProps) => {
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

  return (
    <>
      {/* Reset Button Container */}
      <div className="reset-button-container">
        <button 
          onClick={onResetAll} 
          className="main-reset-button"
          aria-label="Reset all changes to the body model" 
          title="Click to reset all changes"
        >
          Reset All Changes
        </button>
      </div>

      {/* Undo/Redo Container */}
      <div className="undo-redo-container">
        <button className="control-button">↩ Undo</button>
        <button className="control-button">↪ Redo</button>
        <button onClick={captureScreenshot} className="control-button">
          📷 Snapshot
        </button>
      </div>
    </>
  );
};
