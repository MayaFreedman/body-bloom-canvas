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
    
    return {
      fontSize: textMark.fontSize / scaleFactor,
      color: textMark.color,
      fontFamily: textMark.fontFamily,
      fontWeight: textMark.fontWeight,
      fontStyle: textMark.fontStyle
    };
  }, [textMark]);


  // Ensure position is a proper THREE.Vector3, handling serialized positions
  const offsetPosition = useMemo(() => {
    const pos = textMark.position;
    if (pos instanceof THREE.Vector3) {
      return pos;
    }
    // Handle serialized positions that lost their Vector3 prototype
    const posObj = pos as { x: number; y: number; z: number };
    return new THREE.Vector3(posObj.x || 0, posObj.y || 0, posObj.z || 0);
  }, [textMark.position]);

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