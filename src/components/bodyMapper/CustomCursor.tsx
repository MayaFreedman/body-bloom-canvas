import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SelectedSensation } from '@/types/bodyMapperTypes';
import { getSensationImage } from './SensationSelector';

interface CustomCursorProps {
  selectedSensation: SelectedSensation | null;
  isHoveringBody: boolean;
  mode?: string;
  drawingTarget?: 'body' | 'whiteboard';
  isActivelyDrawing?: boolean;
  textToPlace?: string;
  textSettings?: any;
  selectedColor?: string;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ 
  selectedSensation, 
  isHoveringBody, 
  mode = 'select', 
  drawingTarget = 'body',
  isActivelyDrawing = false,
  textToPlace = '',
  textSettings,
  selectedColor = '#000000'
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', updateCursorPosition);
    return () => document.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  // Check if we should show a "not allowed" cursor (drawing on body when in whiteboard mode, but not actively drawing)
  const showNotAllowed = mode === 'draw' && drawingTarget === 'whiteboard' && isHoveringBody && !isActivelyDrawing;

  // Set the document cursor style based on state
  useEffect(() => {
    // Also override any canvas cursor styles that might conflict
    const canvas = document.querySelector('canvas');
    
    if (showNotAllowed) {
      // Show "not allowed" cursor when trying to draw on body in whiteboard mode (but not while actively drawing)
      document.body.style.setProperty('cursor', 'not-allowed', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'not-allowed', 'important');
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
    } else if (mode === 'text') {
      // Hide default cursor when in text mode (we show custom cursor)
      document.body.style.setProperty('cursor', 'none', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'none', 'important');
      console.log('🖱️ Setting none cursor - text mode');
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
  }, [selectedSensation, isHoveringBody, showNotAllowed, mode]);

  // Show custom cursor for sensations OR text mode
  if (!selectedSensation && mode !== 'text') {
    return null;
  }

  // For text mode, show text preview
  if (mode === 'text' && textToPlace.trim()) {
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -100%)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <div 
          className="bg-background border border-border rounded px-2 py-1 shadow-lg text-sm max-w-[200px] truncate"
          style={{
            fontFamily: textSettings?.fontFamily || 'Arial',
            fontSize: '12px',
            fontWeight: textSettings?.fontWeight || 'normal',
            fontStyle: textSettings?.fontStyle || 'normal',
            color: selectedColor
          }}
        >
          {textToPlace}
        </div>
      </div>
    );
  }

  // For sensations, show the sensation icon
  if (selectedSensation) {
    const sensationImage = getSensationImage(selectedSensation.name);

    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: isHoveringBody ? 'translate(-12px, -12px)' : 'translate(-16px, -16px)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <div className="relative">
          <img
            src={sensationImage}
            alt={selectedSensation.name}
            className={`w-8 h-8 object-contain ${isHoveringBody ? 'w-6 h-6' : ''} transition-all duration-150`}
            style={{
              filter: isHoveringBody ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};