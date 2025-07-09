import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface TextRendererProps {
  textMarks: TextMark[];
  onTextClick?: (textMark: TextMark) => void;
}

const TextMarkComponent = ({ 
  textMark, 
  onTextClick 
}: { 
  textMark: TextMark; 
  onTextClick?: (textMark: TextMark) => void; 
}) => {
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
  };

  const handleDoubleClick = (event: any) => {
    event.stopPropagation();
    onTextClick?.(textMark);
  };

  const fontStyle = useMemo(() => {
    // Apply different scaling based on surface to account for coordinate system differences
    const scaleFactor = textMark.surface === 'whiteboard' ? 235 : 300;
    
    console.log('🔤 TextRenderer - Original font from textMark:', textMark.fontFamily);
    
    // Use system fonts for better consistency between HTML and Three.js rendering
    const fontFamily = textMark.fontFamily === 'Arial' 
      ? 'Inter, system-ui, -apple-system, sans-serif'
      : textMark.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';
    
    console.log('🔤 TextRenderer - Final mapped font:', fontFamily);
    console.log('🔤 TextRenderer - Complete textMark:', textMark);
    
    return {
      fontSize: textMark.fontSize / scaleFactor,
      color: textMark.color,
      fontFamily,
      fontWeight: textMark.fontWeight || 'normal',
      fontStyle: textMark.fontStyle || 'normal'
    };
  }, [textMark]);

  // Calculate offset position to prevent text from getting occluded during breathing
  const offsetPosition = useMemo(() => {
    if (textMark.surface === 'whiteboard') {
      return textMark.position; // No offset needed for whiteboard
    }
    
    // For body surface, add larger outward offset to prevent z-fighting during breathing
    const offset = 0.025; // Increased from 0.015 to 0.025 for better clearance
    const pos = textMark.position.clone();
    
    // Add offset along the normal (outward from center)
    const center = new THREE.Vector3(0, 0, 0);
    const direction = pos.clone().sub(center).normalize();
    pos.add(direction.multiplyScalar(offset));
    
    return pos;
  }, [textMark.position, textMark.surface]);

  return (
    <group position={offsetPosition}>
      <Text
        {...fontStyle}
        maxWidth={2}
        lineHeight={1.2}
        anchorX="center"
        anchorY="middle"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        key={`${textMark.id}-${textMark.fontFamily}-${textMark.fontWeight}-${textMark.fontStyle}`} // Force re-render on font changes
      >
        {textMark.text}
      </Text>
      
      {/* Invisible clickable area for better interaction */}
      <mesh
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      >
        <planeGeometry args={[Math.max(textMark.text.length * 0.08, 0.5), 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const TextRenderer = ({ textMarks, onTextClick }: TextRendererProps) => {
  return (
    <>
      {textMarks.map((textMark) => (
        <TextMarkComponent
          key={textMark.id}
          textMark={textMark}
          onTextClick={onTextClick}
        />
      ))}
    </>
  );
};