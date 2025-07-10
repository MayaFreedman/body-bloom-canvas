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
    // Consistent scaling for both surfaces - text placement now handles coordinate systems
    const scaleFactor = textMark.surface === 'whiteboard' ? 235 : 200;
    
    return {
      fontSize: textMark.fontSize / scaleFactor,
      color: textMark.color,
      fontFamily: textMark.fontFamily,
      fontWeight: textMark.fontWeight,
      fontStyle: textMark.fontStyle
    };
  }, [textMark]);

  // Calculate position for proper surface rendering
  const renderPosition = useMemo(() => {
    if (textMark.surface === 'whiteboard') {
      return textMark.position; // Whiteboard text uses world coordinates
    }
    
    // Body text is already in local coordinates with surface offset applied during placement
    return textMark.position;
  }, [textMark.position, textMark.surface]);

  return (
    <group position={renderPosition}>
      <Text
        {...fontStyle}
        maxWidth={2}
        lineHeight={1.2}
        anchorX="center"
        anchorY="middle"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
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