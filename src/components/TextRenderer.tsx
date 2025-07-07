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
  const handleClick = (event: any) => {
    event.stopPropagation();
    onTextClick?.(textMark);
  };

  const fontStyle = useMemo(() => ({
    fontSize: textMark.fontSize / 100, // Scale down for 3D space
    color: textMark.color,
    fontFamily: textMark.fontFamily,
    fontWeight: textMark.fontWeight,
    fontStyle: textMark.fontStyle,
    textAlign: textMark.textAlign as any
  }), [textMark]);

  return (
    <group position={textMark.position} onClick={handleClick}>
      <Text
        {...fontStyle}
        maxWidth={2}
        lineHeight={1.2}
        anchorX={textMark.textAlign}
        anchorY="middle"
      >
        {textMark.text}
      </Text>
      
      {/* Invisible clickable area */}
      <mesh>
        <planeGeometry args={[textMark.text.length * 0.1, 0.2]} />
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