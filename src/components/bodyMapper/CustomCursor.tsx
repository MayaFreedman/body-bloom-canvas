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

  // Show not-allowed cursor when in whiteboard mode and hovering body
  const showNotAllowed = drawingTarget === 'whiteboard' && isHoveringBody && !isActivelyDrawing && !selectedSensation;
  
  console.log('🎯 CustomCursor Debug:', {
    mode,
    drawingTarget, 
    isHoveringBody, 
    isActivelyDrawing, 
    showNotAllowed,
    selectedSensation: !!selectedSensation
  });

  // Set the document cursor style based on state
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    
    if (showNotAllowed) {
      // Show native browser not-allowed cursor
      console.log('🚫 Setting native not-allowed cursor');
      document.body.style.setProperty('cursor', 'not-allowed', 'important');
      if (canvas) canvas.style.setProperty('cursor', 'not-allowed', 'important');
      
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
      if (showNotAllowed || selectedSensation) {
        document.body.style.cursor = 'default';
        if (canvas) canvas.style.cursor = 'default';
      }
    };
  }, [selectedSensation, isHoveringBody, showNotAllowed]);

  // Show custom cursor only for sensations (let native browser handle not-allowed)
  if (!selectedSensation) {
    return null;
  }

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
        {/* Sensation icon */}
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
};