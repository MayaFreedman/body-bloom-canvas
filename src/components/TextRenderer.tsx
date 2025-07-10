import React, { useMemo, useRef, useEffect } from 'react';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';
import { extend, useLoader } from '@react-three/fiber';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

extend({ TextGeometry });

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
  const meshRef = useRef<THREE.Mesh>(null);
  
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
  };

  const handleDoubleClick = (event: any) => {
    event.stopPropagation();
    onTextClick?.(textMark);
  };

  // Load a basic font (fallback to default if not available)
  const font = useLoader(FontLoader, 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');

  const textGeometry = useMemo(() => {
    if (!font) return null;
    
    // Apply different scaling based on surface to account for coordinate system differences
    const scaleFactor = textMark.surface === 'whiteboard' ? 1200 : 1500;
    
    const geometry = new TextGeometry(textMark.text, {
      font: font,
      size: textMark.fontSize / scaleFactor,
      depth: 0.01, // Very thin for 2D-like appearance
      curveSegments: 12,
      bevelEnabled: false,
    });
    
    // Center the geometry
    geometry.computeBoundingBox();
    if (geometry.boundingBox) {
      const centerX = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      const centerY = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      geometry.translate(centerX, centerY, 0);
    }
    
    return geometry;
  }, [font, textMark.text, textMark.fontSize, textMark.surface]);

  // Use position directly since body text is now rendered inside the model group
  const offsetPosition = useMemo(() => {
    return textMark.position; // Direct position for both body and whiteboard
  }, [textMark.position]);

  if (!textGeometry) return null;

  return (
    <group position={offsetPosition}>
      <mesh
        ref={meshRef}
        geometry={textGeometry}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      >
        <meshBasicMaterial color={textMark.color} />
      </mesh>
      
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