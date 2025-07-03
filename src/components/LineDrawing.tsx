
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface LineStroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  width: number;
}

interface LineDrawingProps {
  strokes: LineStroke[];
}

export const LineDrawing = ({ strokes }: LineDrawingProps) => {
  const lineGeometries = useMemo(() => {
    return strokes.map(stroke => {
      if (stroke.points.length < 2) return null;
      
      const points = stroke.points;
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      return {
        id: stroke.id,
        geometry,
        color: stroke.color,
        width: stroke.width
      };
    }).filter(Boolean);
  }, [strokes]);

  return (
    <>
      {lineGeometries.map((line) => (
        <line key={line.id} geometry={line.geometry}>
          <lineBasicMaterial color={line.color} linewidth={line.width} />
        </line>
      ))}
    </>
  );
};
