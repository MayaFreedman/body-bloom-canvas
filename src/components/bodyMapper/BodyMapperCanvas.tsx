
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HumanModel } from '@/components/HumanModel';
import { EffectsRenderer } from '@/components/EffectsRenderer';
import { ModelLineDrawing } from '@/components/ModelLineDrawing';
import SensationParticles from '@/components/SensationParticles';
import { ClickHandler } from './ClickHandler';
import { SensationMark, Effect, BodyPartColors, BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { LineStroke } from '@/types/lineDrawingTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface BodyMapperCanvasProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number;
  selectedSensation: SelectedSensation | null;
  lineStrokes: LineStroke[];
  sensationMarks: SensationMark[];
  effects: Effect[];
  bodyPartColors: BodyPartColors;
  rotation: number;
  modelRef: React.RefObject<THREE.Group>;
  onAddStroke: (stroke: LineStroke) => void;
  onDrawingStrokeStart: () => void;
  onDrawingStrokeComplete: () => void;
  onAddToDrawingStroke: (worldPoint: WorldDrawingPoint) => void;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export const BodyMapperCanvas = ({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  lineStrokes,
  sensationMarks,
  effects,
  bodyPartColors,
  rotation,
  modelRef,
  onAddStroke,
  onDrawingStrokeStart,
  onDrawingStrokeComplete,
  onAddToDrawingStroke,
  onBodyPartClick,
  onSensationClick,
  onRotateLeft,
  onRotateRight
}: BodyMapperCanvasProps) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      position: 'relative',
      backgroundColor: 'transparent'
    }}>
      {/* Left Rotation Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        onClick={onRotateLeft}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      {/* Right Rotation Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
        onClick={onRotateRight}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      <Canvas 
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.2} />
        
        <group ref={modelRef} rotation={[0, rotation, 0]}>
          <HumanModel bodyPartColors={bodyPartColors} />
          
          {/* Render sensation particles as children of the model group */}
          <SensationParticles sensationMarks={sensationMarks} />
        </group>
        
        <ModelLineDrawing
          isDrawing={mode === 'draw'}
          lineStrokes={lineStrokes}
          selectedColor={selectedColor}
          brushSize={brushSize}
          onAddStroke={onAddStroke}
          onStrokeStart={onDrawingStrokeStart}
          onStrokeComplete={onDrawingStrokeComplete}
          onAddToStroke={onAddToDrawingStroke}
          modelRef={modelRef}
        />
        
        <EffectsRenderer effects={effects} />
        
        <ClickHandler 
          mode={mode}
          selectedColor={selectedColor}
          selectedSensation={selectedSensation}
          onBodyPartClick={onBodyPartClick}
          onSensationClick={onSensationClick}
        />
        
        <OrbitControls 
          enableRotate={false}
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enabled={mode !== 'draw'}
        />
      </Canvas>
    </div>
  );
};
