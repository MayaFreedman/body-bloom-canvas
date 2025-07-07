import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SelectedSensation } from '@/types/bodyMapperTypes';
import { getSensationImage } from './SensationSelector';

interface CustomCursorProps {
  selectedSensation: SelectedSensation | null;
  isHoveringBody: boolean;
  mode?: string;
  drawingTarget?: 'body' | 'whiteboard';
}


export const CustomCursor: React.FC<CustomCursorProps> = ({ 
  selectedSensation, 
  isHoveringBody, 
  mode = 'select', 
  drawingTarget = 'body' 
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', updateCursorPosition);
    return () => document.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  // Check if we should show a "not allowed" cursor (drawing on body when in whiteboard mode)
  const showNotAllowed = mode === 'draw' && drawingTarget === 'whiteboard' && isHoveringBody;

  // Set the document cursor style based on state
  useEffect(() => {
    // Also override any canvas cursor styles that might conflict
    const canvas = document.querySelector('canvas');
    
    if (showNotAllowed) {
      // Show "not allowed" cursor when trying to draw on body in whiteboard mode
      document.body.style.setProperty('cursor', 'none', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'none', 'important');
      console.log('🚫 Setting not-allowed cursor - whiteboard mode on body');
    } else if (selectedSensation) {
      if (isHoveringBody) {
        // Force grabby hand when hovering over body with sensation selected - use !important override
        document.body.style.setProperty('cursor', 'grab', 'important');
        if (canvas) canvas.style.setProperty('cursor', 'grab', 'important');
        console.log('🖱️ Setting grab cursor - hovering body with sensation');
      } else {
        // Hide default cursor when sensation is selected but not hovering body
        document.body.style.setProperty('cursor', 'none', 'important');
        if (canvas) canvas.style.setProperty('cursor', 'none', 'important');
        console.log('🖱️ Setting none cursor - sensation selected but not hovering');
      }
    } else {
      // Default cursor when no sensation selected
      document.body.style.setProperty('cursor', 'default', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'default', 'important');
      console.log('🖱️ Setting default cursor - no sensation selected');
    }

    return () => {
      document.body.style.cursor = 'default';
      if (canvas) canvas.style.cursor = 'default';
    };
  }, [selectedSensation, isHoveringBody, showNotAllowed]);

  // Show custom cursor if sensation is selected OR if we need to show not-allowed
  if (!selectedSensation && !showNotAllowed) {
    return null;
  }

  const sensationImage = selectedSensation ? getSensationImage(selectedSensation.name) : null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
      style={{
        left: cursorPosition.x,
        top: cursorPosition.y,
        transform: (isHoveringBody || showNotAllowed) ? 'translate(-12px, -12px)' : 'translate(-16px, -16px)',
        opacity: (isHoveringBody || showNotAllowed) ? 0.8 : 1
      }}
    >
      <div className="relative">
        {showNotAllowed ? (
          // "Not allowed" cursor - circle with cross
          <div className="w-6 h-6 bg-destructive/80 rounded-full flex items-center justify-center border-2 border-destructive backdrop-blur-sm">
            <X className="w-3 h-3 text-destructive-foreground" strokeWidth={3} />
          </div>
        ) : selectedSensation && sensationImage ? (
          // Sensation icon
          <img
            src={sensationImage}
            alt={selectedSensation.name}
            className={`w-8 h-8 object-contain ${isHoveringBody ? 'w-6 h-6' : ''} transition-all duration-150`}
            style={{
              filter: isHoveringBody ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        ) : null}
      </div>
    </div>
  );
};