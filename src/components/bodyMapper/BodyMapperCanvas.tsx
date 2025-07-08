
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HumanModel } from '@/components/HumanModel';
import { EffectsRenderer } from '@/components/EffectsRenderer';
import { ModelDrawing } from '@/components/ModelDrawing';
import SensationParticles from '@/components/SensationParticles';
import { CustomCursor } from './CustomCursor';
import { ClickHandler } from './ClickHandler';
import { HoverDetector } from './HoverDetector';
import { EraserHandler } from './EraserHandler';
import { WhiteboardPlane } from './WhiteboardPlane';
import { TextPlacementHandler } from './TextPlacementHandler';
import { InlineTextEditor } from './InlineTextEditor';
import { TextRenderer } from '@/components/TextRenderer';
import { useSidebarHover } from '@/hooks/useSidebarHover';
import { DrawingMark, SensationMark, Effect, BodyPartColors, BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface BodyMapperCanvasProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number;
  drawingTarget: 'body' | 'whiteboard';
  selectedSensation: SelectedSensation | null;
  drawingMarks: DrawingMark[];
  sensationMarks: SensationMark[];
  effects: Effect[];
  bodyPartColors: BodyPartColors;
  rotation: number;
  isActivelyDrawing?: boolean;
  textMarks?: TextMark[];
  editingTextId?: string | null;
  textToPlace?: string;
  textSettings?: any;
  modelRef: React.RefObject<THREE.Group>;
  onAddDrawingMark: (mark: DrawingMark) => void;
  onDrawingStrokeStart: () => void;
  onDrawingStrokeComplete: () => void;
  onAddToDrawingStroke: (worldPoint: WorldDrawingPoint) => void;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onSensationDeselect: () => void;
  onErase: (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard') => void;
  onTextPlace?: (position: THREE.Vector3, surface: 'body' | 'whiteboard') => void;
  onTextClick?: (textMark: TextMark) => void;
  onTextSave?: (text: string) => void;
  onTextCancel?: () => void;
  onTextDelete?: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export const BodyMapperCanvas = ({
  mode,
  selectedColor,
  brushSize,
  drawingTarget,
  selectedSensation,
  drawingMarks,
  sensationMarks,
  effects,
  bodyPartColors,
  rotation,
  isActivelyDrawing = false,
  textMarks = [],
  editingTextId,
  textToPlace = '',
  textSettings,
  modelRef,
  onAddDrawingMark,
  onDrawingStrokeStart,
  onDrawingStrokeComplete,
  onAddToDrawingStroke,
  onBodyPartClick,
  onSensationClick,
  onSensationDeselect,
  onErase,
  onTextPlace,
  onTextClick,
  onTextSave,
  onTextCancel,
  onTextDelete,
  onRotateLeft,
  onRotateRight
}: BodyMapperCanvasProps) => {
  console.log('BodyMapperCanvas rendering with sensation marks:', sensationMarks);
  const [isHoveringBody, setIsHoveringBody] = useState(false);
  const isHoveringSidebar = useSidebarHover();
  
  // Handle sensation click with auto-deselect
  const handleSensationClick = (position: THREE.Vector3, sensation: SelectedSensation) => {
    onSensationClick(position, sensation);
    onSensationDeselect(); // Auto-deselect after placing
  };
  
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
          <HumanModel bodyPartColors={bodyPartColors}>
            {/* Content that should breathe with the body */}
            {drawingMarks.filter(mark => mark.surface !== 'whiteboard').map((mark) => (
              <mesh key={mark.id} position={mark.position}>
                <sphereGeometry args={[mark.size, 8, 8]} />
                <meshBasicMaterial color={mark.color} />      
              </mesh>
            ))}

            <SensationParticles sensationMarks={sensationMarks} />
            
            <TextRenderer 
              textMarks={textMarks.filter(mark => mark.surface === 'body')} 
              onTextClick={onTextClick}
            />
          </HumanModel>
          
          <WhiteboardPlane visible={drawingTarget === 'whiteboard'} />
        </group>
        
        {/* Render whiteboard marks outside the model group so they don't rotate */}
        {drawingMarks.filter(mark => mark.surface === 'whiteboard').map((mark) => (
          <mesh key={mark.id} position={mark.position}>
            <sphereGeometry args={[mark.size, 8, 8]} />
            <meshBasicMaterial color={mark.color} />      
          </mesh>
        ))}
        
        {/* Render text marks on whiteboard outside the model group */}
        <TextRenderer 
          textMarks={textMarks.filter(mark => mark.surface === 'whiteboard')} 
          onTextClick={onTextClick}
        />
        
        <ModelDrawing
          isDrawing={mode === 'draw'}
          drawingMarks={drawingMarks}
          selectedColor={selectedColor}
          brushSize={brushSize}
          drawingTarget={drawingTarget}
          onAddMark={onAddDrawingMark}
          onStrokeStart={onDrawingStrokeStart}
          onStrokeComplete={onDrawingStrokeComplete}
          onAddToStroke={onAddToDrawingStroke}
          modelRef={modelRef}
        />
        
        <EraserHandler
          isErasing={mode === 'erase'}
          eraserRadius={brushSize / 100}
          drawingTarget={drawingTarget}
          onErase={onErase}
          modelRef={modelRef}
        />
        
        {onTextPlace && (
          <TextPlacementHandler
            isTextMode={mode === 'text'}
            selectedColor={selectedColor}
            drawingTarget={drawingTarget}
            onTextPlace={onTextPlace}
            modelRef={modelRef}
          />
        )}
        
        <EffectsRenderer effects={effects} />
        
        <ClickHandler 
          mode={mode}
          selectedColor={selectedColor}
          selectedSensation={selectedSensation}
          onBodyPartClick={onBodyPartClick}
          onSensationClick={handleSensationClick}
        />
        
        <HoverDetector onHoverChange={setIsHoveringBody} />
        
        <OrbitControls 
          enableRotate={false}
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enabled={mode !== 'draw' && mode !== 'erase' && mode !== 'text'}
        />
      </Canvas>
      
      {/* Custom cursor outside Canvas for global mouse tracking */}
      <CustomCursor 
        selectedSensation={selectedSensation}
        isHoveringBody={isHoveringBody}
        isHoveringSidebar={isHoveringSidebar}
        mode={mode}
        drawingTarget={drawingTarget}
        isActivelyDrawing={isActivelyDrawing}
        textToPlace={textToPlace}
        textSettings={textSettings}
        selectedColor={selectedColor}
      />
      
      {/* Inline Text Editor */}
      {onTextSave && onTextCancel && editingTextId && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <InlineTextEditor
              textMark={textMarks.find(mark => mark.id === editingTextId)!}
              onSave={onTextSave}
              onCancel={onTextCancel}
              onDelete={onTextDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
};
