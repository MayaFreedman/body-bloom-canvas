import React, { useEffect, useState } from 'react';
import { X, Trash2, Paintbrush, PaintBucket, Eraser } from 'lucide-react';
import { SelectedSensation } from '@/types/bodyMapperTypes';
import { getSensationImage } from './SensationSelector';

interface CustomCursorProps {
  selectedSensation: SelectedSensation | null;
  isHoveringBody: boolean;
  isHoveringSidebar?: boolean;
  isHoveringControlButtons?: boolean;
  mode?: string;
  drawingTarget?: 'body' | 'whiteboard';
  isActivelyDrawing?: boolean;
  textToPlace?: string;
  textSettings?: any;
  selectedColor?: string;
  clearFillMode?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ 
  selectedSensation, 
  isHoveringBody, 
  isHoveringSidebar = false,
  isHoveringControlButtons = false,
  mode = 'select', 
  drawingTarget = 'body',
  isActivelyDrawing = false,
  textToPlace = '',
  textSettings,
  selectedColor = '#000000',
  clearFillMode = false
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', updateCursorPosition);
    return () => document.removeEventListener('mousemove', updateCursorPosition);
  }, []);

  // Check if we should show a "not allowed" cursor (drawing on body when in whiteboard mode, but not actively drawing, and no sensation selected)
  const showNotAllowed = mode === 'draw' && drawingTarget === 'whiteboard' && isHoveringBody && !isActivelyDrawing && !selectedSensation;

  // Set the document cursor style based on state
  useEffect(() => {
    if (showNotAllowed) {
      // Show "not allowed" cursor when trying to draw on body in whiteboard mode (but not while actively drawing)
      document.body.style.setProperty('cursor', 'not-allowed', 'important');
    } else if (selectedSensation) {
      if (isHoveringSidebar || isHoveringControlButtons) {
        // Show default cursor when hovering sidebar or control buttons with sensation selected
        document.body.style.setProperty('cursor', 'default', 'important');
        
      } else if (isHoveringBody) {
        // Force grabby hand when hovering over body with sensation selected - use !important override
        document.body.style.setProperty('cursor', 'grab', 'important');
      } else {
        // Hide default cursor when sensation is selected but not hovering body
        document.body.style.setProperty('cursor', 'none', 'important');
      }
    } else if (mode === 'text') {
      if (isHoveringSidebar || isHoveringControlButtons) {
        // Show default cursor when hovering sidebar or control buttons in text mode
        document.body.style.setProperty('cursor', 'default', 'important');
        
      } else {
        // Hide default cursor when in text mode (we show custom cursor)
        document.body.style.setProperty('cursor', 'none', 'important');
      }
    } else if (mode === 'draw' || mode === 'erase' || (mode === 'fill' && !clearFillMode)) {
      if (isHoveringSidebar || isHoveringControlButtons) {
        // Show default cursor when hovering sidebar or control buttons
        document.body.style.setProperty('cursor', 'default', 'important');
      } else {
        // Hide default cursor when in drawing modes (we show custom cursor)
        document.body.style.setProperty('cursor', 'none', 'important');
      }
    } else if (mode === 'fill' && clearFillMode) {
      if (isHoveringSidebar || isHoveringControlButtons) {
        // Show default cursor when hovering sidebar or control buttons in clear fill mode
        document.body.style.setProperty('cursor', 'default', 'important');
      } else {
        // Hide default cursor when in clear fill mode (we show custom cursor)
        document.body.style.setProperty('cursor', 'none', 'important');
      }
    } else {
      // Default cursor when no sensation selected
      document.body.style.setProperty('cursor', 'default', 'important');
      
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [selectedSensation, isHoveringBody, showNotAllowed, mode, isHoveringSidebar, isHoveringControlButtons, clearFillMode]);

  // Show custom cursor for sensations OR text mode OR drawing modes, but not when hovering sidebar or control buttons
  if ((!selectedSensation && mode !== 'text' && mode !== 'draw' && mode !== 'erase' && mode !== 'fill') || isHoveringSidebar || isHoveringControlButtons) {
    return null;
  }

  // For clear fill mode, show trash icon
  if (mode === 'fill' && clearFillMode) {
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-12px, -12px)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <Trash2 size={20} className="text-red-500 drop-shadow-lg" />
      </div>
    );
  }

  // For draw mode, show paintbrush icon
  if (mode === 'draw') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-12px, -12px)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <Paintbrush size={20} style={{ color: selectedColor }} className="drop-shadow-lg" />
      </div>
    );
  }

  // For erase mode, show eraser icon
  if (mode === 'erase') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-12px, -12px)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <Eraser size={20} className="text-gray-700 drop-shadow-lg" />
      </div>
    );
  }

  // For fill mode (regular), show paint bucket icon
  if (mode === 'fill' && !clearFillMode) {
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-12px, -12px)',
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <PaintBucket size={20} style={{ color: selectedColor }} className="drop-shadow-lg" />
      </div>
    );
  }

  // For text mode, show text preview
  if (mode === 'text' && textToPlace.trim()) {
    const fontSize = (textSettings?.fontSize || 16) * 1.3; // Scale up preview by 1.3x
    
    return (
      <div
        className="fixed pointer-events-none z-[9999] transition-opacity duration-150"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: 'translate(-50%, -50%)', // Changed from -100% to -50% for better alignment
          opacity: isHoveringBody ? 0.8 : 1
        }}
      >
        <div 
          style={{
            fontFamily: textSettings?.fontFamily || 'Arial',
            fontSize: `${fontSize}px`,
            fontWeight: textSettings?.fontWeight || 'normal',
            fontStyle: textSettings?.fontStyle || 'normal',
            color: selectedColor,
            textShadow: '1px 1px 2px rgba(0,0,0,0.08)',
            whiteSpace: 'nowrap',
            lineHeight: 1.2
          }}
        >
          {textToPlace}
        </div>
      </div>
    );
  }

  // For sensations, show the sensation icon
  if (selectedSensation) {
    // For custom effects, pass the icon to get the correct image
    const customIcon = selectedSensation.isCustom ? selectedSensation.icon : undefined;
    const sensationImage = getSensationImage(selectedSensation.name, customIcon);

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
              filter: `hue-rotate(${selectedSensation.color ? 0 : 0}deg) saturate(${selectedSensation.color ? 1.2 : 1}) ${isHoveringBody ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}`,
              // Apply color tint for custom effects
              ...(selectedSensation.isCustom && selectedSensation.color ? {
                filter: `drop-shadow(0 0 0 ${selectedSensation.color}) ${isHoveringBody ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'}`,
                mixBlendMode: 'multiply' as const
              } : {})
            }}
          />
          {/* Color overlay for custom effects */}
          {selectedSensation.isCustom && selectedSensation.color && (
            <div 
              className="absolute inset-0 w-8 h-8 object-contain transition-all duration-150"
              style={{
                backgroundColor: selectedSensation.color,
                mixBlendMode: 'multiply',
                borderRadius: '4px',
                opacity: 0.6
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
};