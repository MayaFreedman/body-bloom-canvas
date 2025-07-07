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
}


export const CustomCursor: React.FC<CustomCursorProps> = ({ 
  selectedSensation, 
  isHoveringBody, 
  mode = 'select', 
  drawingTarget = 'body',
  isActivelyDrawing = false
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', updateCursorPosition);
    return () => document.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  // Check if we should show a "not allowed" cursor (any mode when whiteboard is selected and hovering body, but not actively drawing)
  const showNotAllowed = drawingTarget === 'whiteboard' && isHoveringBody && !isActivelyDrawing;
  
  // TEMP: Force show not-allowed when in whiteboard mode (regardless of hover) to test
  const forceNotAllowed = drawingTarget === 'whiteboard' && !isActivelyDrawing && !selectedSensation;
  
  console.log('🎯 CustomCursor Debug:', {
    mode,
    drawingTarget, 
    isHoveringBody, 
    isActivelyDrawing, 
    showNotAllowed,
    forceNotAllowed,
    selectedSensation: !!selectedSensation
  });

  // Set the document cursor style based on state
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    
    if (forceNotAllowed) {
      // HIDE browser cursor entirely and show custom not-allowed cursor
      console.log('🚫 HIDING BROWSER CURSOR - showing custom not-allowed');
      document.body.style.setProperty('cursor', 'none', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'none', 'important');
      
    } else if (selectedSensation) {
      if (isHoveringBody) {
        document.body.style.setProperty('cursor', 'grab', 'important');
        if (canvas) canvas.style.setProperty('cursor', 'grab', 'important');
        console.log('🖱️ Setting grab cursor - hovering body with sensation');
      } else {
        document.body.style.setProperty('cursor', 'none', 'important');
        if (canvas) canvas.style.setProperty('cursor', 'none', 'important');
        console.log('🖱️ Setting none cursor - sensation selected but not hovering');
      }
    } else {
      // Allow other cursor handlers to take precedence
      document.body.style.removeProperty('cursor');
      if (canvas) canvas.style.removeProperty('cursor');
      console.log('🖱️ Removing cursor override - letting other handlers control');
    }

    return () => {
      if (forceNotAllowed || selectedSensation) {
        document.body.style.cursor = 'default';
        if (canvas) canvas.style.cursor = 'default';
      }
    };
  }, [selectedSensation, isHoveringBody, forceNotAllowed]);

  // Show custom cursor for sensations OR not-allowed state
  if (!selectedSensation && !forceNotAllowed) {
    return null;
  }

  const sensationImage = selectedSensation ? getSensationImage(selectedSensation.name) : null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
      style={{
        left: cursorPosition.x,
        top: cursorPosition.y,
        transform: (isHoveringBody || forceNotAllowed) ? 'translate(-12px, -12px)' : 'translate(-16px, -16px)',
        opacity: (isHoveringBody || forceNotAllowed) ? 0.8 : 1
      }}
    >
      <div className="relative">
        {forceNotAllowed ? (
          // Custom "Not allowed" cursor - circle with cross
          <div className="w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center border-2 border-destructive backdrop-blur-sm shadow-lg">
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