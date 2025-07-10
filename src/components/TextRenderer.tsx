import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface TextRendererProps {
  textMarks: TextMark[];
  onTextClick?: (textMark: TextMark) => void;
  rotation?: number;
}

const TextMarkComponent = ({ 
  textMark, 
  onTextClick,
  rotation = 0
}: { 
  textMark: TextMark; 
  onTextClick?: (textMark: TextMark) => void; 
  rotation?: number;
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
    let basePos: THREE.Vector3;
    
    if (pos instanceof THREE.Vector3) {
      basePos = pos.clone();
    } else {
      // Handle serialized positions that lost their Vector3 prototype
      const posObj = pos as { x: number; y: number; z: number };
      basePos = new THREE.Vector3(posObj.x || 0, posObj.y || 0, posObj.z || 0);
    }
    
    // Add small Z offset in the direction the model is facing to prevent clipping during breathing
    const zOffset = 0.08;
    // Account for the model's base rotation of Math.PI / 2
    const adjustedRotation = rotation + Math.PI / 2;
    const facingX = Math.sin(adjustedRotation);
    const facingZ = Math.cos(adjustedRotation);
    
    basePos.x += facingX * zOffset;
    basePos.z += facingZ * zOffset;
    
    return basePos;
  }, [textMark.position, rotation]);

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
        rotation={[0, -rotation, 0]}
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

export const TextRenderer = ({ textMarks, onTextClick, rotation }: TextRendererProps) => {
  return (
    <>
      {textMarks.map((textMark) => (
        <TextMarkComponent
          key={textMark.id}
          textMark={textMark}
          onTextClick={onTextClick}
          rotation={rotation}
        />
      ))}
    </>
  );
};