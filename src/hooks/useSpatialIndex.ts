
import { useCallback, useRef } from 'react';
import { DrawingMark, SpatialNode } from '@/types/actionHistoryTypes';
import * as THREE from 'three';

export const useSpatialIndex = () => {
  const spatialTreeRef = useRef<SpatialNode | null>(null);

  const buildSpatialIndex = useCallback((marks: DrawingMark[]) => {
    if (marks.length === 0) {
      spatialTreeRef.current = null;
      return;
    }

    // Calculate overall bounds
    const bounds = marks.reduce((acc, mark) => {
      return {
        min: {
          x: Math.min(acc.min.x, mark.position.x),
          y: Math.min(acc.min.y, mark.position.y),
          z: Math.min(acc.min.z, mark.position.z)
        },
        max: {
          x: Math.max(acc.max.x, mark.position.x),
          y: Math.max(acc.max.y, mark.position.y),
          z: Math.max(acc.max.z, mark.position.z)
        }
      };
    }, {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    });

    spatialTreeRef.current = {
      bounds: {
        min: new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
        max: new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z)
      },
      marks: marks
    };
  }, []);

  const queryRadius = useCallback((center: THREE.Vector3, radius: number): DrawingMark[] => {
    if (!spatialTreeRef.current) return [];

    return spatialTreeRef.current.marks.filter(mark => {
      const distance = mark.position.distanceTo(center);
      return distance <= radius + mark.size;
    });
  }, []);

  const queryBox = useCallback((min: THREE.Vector3, max: THREE.Vector3): DrawingMark[] => {
    if (!spatialTreeRef.current) return [];

    return spatialTreeRef.current.marks.filter(mark => {
      const pos = mark.position;
      return pos.x >= min.x && pos.x <= max.x &&
             pos.y >= min.y && pos.y <= max.y &&
             pos.z >= min.z && pos.z <= max.z;
    });
  }, []);

  return {
    buildSpatialIndex,
    queryRadius,
    queryBox
  };
};
