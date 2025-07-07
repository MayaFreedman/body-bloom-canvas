import React, { useEffect, useState } from 'react';
import { SelectedSensation } from '@/types/bodyMapperTypes';
import { getSensationImage } from './SensationSelector';

interface CustomCursorProps {
  selectedSensation: SelectedSensation | null;
  isHoveringBody: boolean;
}


export const CustomCursor: React.FC<CustomCursorProps> = ({ selectedSensation, isHoveringBody }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', updateCursorPosition);
    return () => document.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  // Set the document cursor style based on state
  useEffect(() => {
    if (selectedSensation) {
      if (isHoveringBody) {
        // Force grabby hand when hovering over body with sensation selected - use !important override
        document.body.style.setProperty('cursor', 'grab', 'important');
        console.log('🖱️ Setting grab cursor - hovering body with sensation');
      } else {
        // Hide default cursor when sensation is selected but not hovering body
        document.body.style.setProperty('cursor', 'none', 'important');
        console.log('🖱️ Setting none cursor - sensation selected but not hovering');
      }
    } else {
      // Default cursor when no sensation selected
      document.body.style.setProperty('cursor', 'default', 'important');
      console.log('🖱️ Setting default cursor - no sensation selected');
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [selectedSensation, isHoveringBody]);

  // Don't render custom cursor if no sensation is selected
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