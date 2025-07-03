
import { useState, useCallback } from 'react';
import { DrawingMark, SensationMark, Effect, BodyPartColors, BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import * as THREE from 'three';

export const useBodyMapperState = () => {
  const [mode, setMode] = useState<BodyMapperMode>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([3]); // Changed from 10 to 3 (new minimum)
  const [selectedSensation, setSelectedSensation] = useState<SelectedSensation | null>(null);
  const [drawingMarks, setDrawingMarks] = useState<DrawingMark[]>([]);
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [bodyPartColors, setBodyPartColors] = useState<BodyPartColors>({});
  const [rotation, setRotation] = useState(0);

  const handleAddDrawingMark = useCallback((mark: DrawingMark) => {
    setDrawingMarks(prev => [...prev, mark]);
  }, []);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));
  }, []);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: SelectedSensation) => {
    const newSensationMark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1
    };
    setSensationMarks(prev => [...prev, newSensationMark]);
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation(prev => prev - Math.PI / 2);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation(prev => prev + Math.PI / 2);
  }, []);

  const clearAll = useCallback(() => {
    setDrawingMarks([]);
    setEffects([]);
    setBodyPartColors({});
    setSensationMarks([]);
  }, []);

  return {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedSensation,
    setSelectedSensation,
    drawingMarks,
    setDrawingMarks,
    sensationMarks,
    setSensationMarks,
    effects,
    setEffects,
    bodyPartColors,
    setBodyPartColors,
    rotation,
    setRotation,
    handleAddDrawingMark,
    handleBodyPartClick,
    handleSensationClick,
    rotateLeft,
    rotateRight,
    clearAll
  };
};
