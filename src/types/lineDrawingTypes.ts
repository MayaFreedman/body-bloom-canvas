
import * as THREE from 'three';

export interface LineStroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  width: number;
}

export interface LineDrawingState {
  lineStrokes: LineStroke[];
}
