
import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface DrawingPoint {
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface DrawingOnModelProps {
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
}

export const DrawingOnModel: React.FC<DrawingOnModelProps> = ({
  isDrawing,
  selectedColor,
  brushSize,
  onStartDrawing,
  onStopDrawing
}) => {
  const { camera, gl, raycaster, mouse, scene } = useThree();
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  const handlePointerDown = useCallback((event: THREE.Event) => {
    if (event.intersections && event.intersections.length > 0) {
      const intersection = event.intersections[0];
      if (intersection.object.userData.bodyPart) {
        onStartDrawing();
        
        // Add drawing point at intersection
        const newPoint: DrawingPoint = {
          position: intersection.point.clone(),
          color: selectedColor,
          size: brushSize / 100
        };
        
        setDrawingPoints(prev => [...prev, newPoint]);
      }
    }
  }, [selectedColor, brushSize, onStartDrawing]);

  const handlePointerMove = useCallback((event: THREE.Event) => {
    if (isDrawing && event.intersections && event.intersections.length > 0) {
      const intersection = event.intersections[0];
      if (intersection.object.userData.bodyPart) {
        const newPoint: DrawingPoint = {
          position: intersection.point.clone(),
          color: selectedColor,
          size: brushSize / 100
        };
        
        setDrawingPoints(prev => [...prev, newPoint]);
      }
    }
  }, [isDrawing, selectedColor, brushSize]);

  const handlePointerUp = useCallback(() => {
    onStopDrawing();
  }, [onStopDrawing]);

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Render drawing points as small spheres */}
      {drawingPoints.map((point, index) => (
        <mesh key={index} position={point.position}>
          <sphereGeometry args={[point.size, 8, 8]} />
          <meshBasicMaterial color={point.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};
