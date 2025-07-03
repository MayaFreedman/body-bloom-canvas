
import React from 'react';
import { BodyMapperCanvas } from './BodyMapperCanvas';
import { BodyMapperControls } from './BodyMapperControls';
import { ControlButtons } from './ControlButtons';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface BodyMapperLayoutProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  selectedSensation: SelectedSensation | null;
  drawingMarks: any[];
  bodyPartColors: Record<string, string>;
  rotation: number;
  modelRef: React.RefObject<THREE.Group>;
  controlsRef: React.RefObject<any>;
  canvasRef: React.RefObject<HTMLDivElement>;
  canUndo: boolean;
  canRedo: boolean;
  setMode: (mode: BodyMapperMode) => void;
  setSelectedColor: (color: string) => void;
  setBrushSize: (size: number[]) => void;
  setSelectedSensation: (sensation: SelectedSensation | null) => void;
  onAddDrawingMark: (mark: any) => void;
  onDrawingStrokeStart: () => void;
  onDrawingStrokeComplete: () => void;
  onAddToDrawingStroke: (worldPoint: WorldDrawingPoint) => void;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onResetAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onEmotionsUpdate: (updateData: any) => void;
}

export const BodyMapperLayout = ({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  drawingMarks,
  bodyPartColors,
  rotation,
  modelRef,
  controlsRef,
  canvasRef,
  canUndo,
  canRedo,
  setMode,
  setSelectedColor,
  setBrushSize,
  setSelectedSensation,
  onAddDrawingMark,
  onDrawingStrokeStart,
  onDrawingStrokeComplete,
  onAddToDrawingStroke,
  onBodyPartClick,
  onSensationClick,
  onRotateLeft,
  onRotateRight,
  onResetAll,
  onUndo,
  onRedo,
  onEmotionsUpdate
}: BodyMapperLayoutProps) => {
  return (
    <div className="game-container">
      <div className="canvas-container">
        <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
          <BodyMapperCanvas
            mode={mode}
            selectedColor={selectedColor}
            brushSize={brushSize[0]}
            selectedSensation={selectedSensation}
            drawingMarks={drawingMarks}
            sensationMarks={[]}
            effects={[]}
            bodyPartColors={bodyPartColors}
            rotation={rotation}
            modelRef={modelRef}
            onAddDrawingMark={onAddDrawingMark}
            onDrawingStrokeStart={onDrawingStrokeStart}
            onDrawingStrokeComplete={onDrawingStrokeComplete}
            onAddToDrawingStroke={onAddToDrawingStroke}
            onBodyPartClick={onBodyPartClick}
            onSensationClick={onSensationClick}
            onRotateLeft={onRotateLeft}
            onRotateRight={onRotateRight}
          />
        </div>
        
        <ControlButtons 
          onResetAll={onResetAll}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          canvasRef={canvasRef}
        />
      </div>

      <div className="controls-container">
        <div id="rightColumn">
          <BodyMapperControls
            ref={controlsRef}
            mode={mode}
            selectedColor={selectedColor}
            brushSize={brushSize}
            selectedSensation={selectedSensation}
            onModeChange={setMode}
            onColorChange={setSelectedColor}
            onBrushSizeChange={setBrushSize}
            onSensationChange={setSelectedSensation}
            onEmotionsUpdate={onEmotionsUpdate}
          />
        </div>
      </div>
    </div>
  );
};
