import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';
import { getFontUrl } from '@/utils/fontMapping';

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
    
    const fontUrl = getFontUrl(textMark.fontFamily);
    
    console.log('🔤 TextRenderer - Font URL for troika:', fontUrl);
    
    return {
      fontSize: textMark.fontSize / scaleFactor,
      color: textMark.color,
      font: fontUrl, // Use font URL for troika-three-text
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

  // Debug logging for props passed to Text component
  console.log('🔤 TextRenderer - Props being passed to Text component:', {
    ...fontStyle,
    maxWidth: 2,
    lineHeight: 1.2,
    anchorX: "center",
    anchorY: "middle"
  });

  // Simplified approach - don't pass font URLs that might fail to load
  const safeProps = {
    fontSize: fontStyle.fontSize,
    color: fontStyle.color,
    // Only pass font if it's a valid URL, otherwise let it use default
    ...(fontStyle.font && fontStyle.font.startsWith('http') ? {} : { font: fontStyle.font })
  };

  return (
    <group position={offsetPosition}>
      <Text
        {...safeProps}
        maxWidth={2}
        lineHeight={1.2}
        anchorX="center"
        anchorY="middle"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        key={`${textMark.id}-${textMark.fontFamily}-${textMark.fontWeight}-${textMark.fontStyle}`}
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