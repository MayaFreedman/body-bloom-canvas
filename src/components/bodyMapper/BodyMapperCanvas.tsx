
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HumanModel } from '@/components/HumanModel';
import { EffectsRenderer } from '@/components/EffectsRenderer';
import { ModelDrawing } from '@/components/ModelDrawing';
import SensationParticles from '@/components/SensationParticles';
import { ClickHandler } from './ClickHandler';
import { EraserHandler } from './EraserHandler';
import { DrawingMark, SensationMark, Effect, BodyPartColors, BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface BodyMapperCanvasProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number;
  selectedSensation: SelectedSensation | null;
  drawingMarks: DrawingMark[];
  sensationMarks: SensationMark[];
  effects: Effect[];
  bodyPartColors: BodyPartColors;
  rotation: number;
  modelRef: React.RefObject<THREE.Group>;
  onAddDrawingMark: (mark: DrawingMark) => void;
  onDrawingStrokeStart: () => void;
  onDrawingStrokeComplete: () => void;
  onAddToDrawingStroke: (worldPoint: WorldDrawingPoint) => void;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onErase: (center: THREE.Vector3, radius: number) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export const BodyMapperCanvas = ({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  drawingMarks,
  sensationMarks,
  effects,
  bodyPartColors,
  rotation,
  modelRef,
  onAddDrawingMark,
  onDrawingStrokeStart,
  onDrawingStrokeComplete,
  onAddToDrawingStroke,
  onBodyPartClick,
  onSensationClick,
  onErase,
  onRotateLeft,
  onRotateRight
}: BodyMapperCanvasProps) => {
  console.log('BodyMapperCanvas rendering with sensation marks:', sensationMarks);
  
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
          
          {/* Render drawing marks as children of the model group so they rotate with it */}
          {drawingMarks.map((mark) => (
            <mesh key={mark.id} position={mark.position}>
              <sphereGeometry args={[mark.size, 8, 8]} />
              <meshBasicMaterial color={mark.color} />      
            </mesh>
          ))}

          {/* Render sensation particles as children of the model group */}
          <SensationParticles sensationMarks={sensationMarks} />
        </group>
        
        <ModelDrawing
          isDrawing={mode === 'draw'}
          drawingMarks={drawingMarks}
          selectedColor={selectedColor}
          brushSize={brushSize}
          onAddMark={onAddDrawingMark}
          onStrokeStart={onDrawingStrokeStart}
          onStrokeComplete={onDrawingStrokeComplete}
          onAddToStroke={onAddToDrawingStroke}
          modelRef={modelRef}
        />
        
        <EraserHandler
          isErasing={mode === 'erase'}
          eraserRadius={brushSize / 100}
          onErase={onErase}
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
          enabled={mode !== 'draw' && mode !== 'erase'}
        />
      </Canvas>
    </div>
  );
};
