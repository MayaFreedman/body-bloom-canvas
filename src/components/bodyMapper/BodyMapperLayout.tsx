
import React, { useState, useRef } from 'react';
import { BodyMapperCanvas } from './BodyMapperCanvas';
import { BodyMapperControls } from './BodyMapperControls';
import { ControlButtons } from './ControlButtons';
import { SensationPlacementPopup } from './SensationPlacementPopup';
import { DrawingTargetSelector } from './DrawingTargetSelector';
import { WhiteboardPlane } from './WhiteboardPlane';
import { ScreenshotCaptureHandle } from './ScreenshotCapture';
import { BodyMapperMode, SelectedSensation, SensationMark } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import { TextMark, TextSettings } from '@/types/textTypes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as THREE from 'three';

interface BodyMapperLayoutProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  drawingTarget: 'body' | 'whiteboard';
  isActivelyDrawing: boolean;
  selectedSensation: SelectedSensation | null;
  drawingMarks: any[];
  sensationMarks: SensationMark[];
  textMarks: TextMark[];
  textSettings?: TextSettings;
  textToPlace?: string;
  editingTextId: string | null;
  bodyPartColors: Record<string, string>;
  whiteboardBackground?: string;
  rotation: number;
  modelRef: React.RefObject<THREE.Group>;
  controlsRef: React.RefObject<any>;
  canvasRef: React.RefObject<HTMLDivElement>;
  canUndo: boolean;
  canRedo: boolean;
  setMode: (mode: BodyMapperMode) => void;
  setSelectedColor: (color: string) => void;
  setBrushSize: (size: number[]) => void;
  setDrawingTarget: (target: 'body' | 'whiteboard') => void;
  setSelectedSensation: (sensation: SelectedSensation | null) => void;
  setTextSettings?: (settings: Partial<TextSettings>) => void;
  setTextToPlace?: (text: string) => void;
  onAddDrawingMark: (mark: any) => void;
  onDrawingStrokeStart: () => void;
  onDrawingStrokeComplete: () => void;
  onAddToDrawingStroke: (worldPoint: WorldDrawingPoint) => void;
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: SelectedSensation) => void;
  onErase: (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard') => void;
  onWhiteboardFill?: (color: string) => void;
  onTextPlace?: (position: THREE.Vector3, surface: 'body' | 'whiteboard') => void;
  onTextClick?: (textMark: TextMark) => void;
  onTextSave?: (text: string) => void;
  onTextCancel?: () => void;
  onTextDelete?: () => void;
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
  drawingTarget,
  isActivelyDrawing,
  selectedSensation,
  drawingMarks,
  sensationMarks,
  textMarks,
  textSettings,
  textToPlace,
  editingTextId,
  bodyPartColors,
  whiteboardBackground,
  rotation,
  modelRef,
  controlsRef,
  canvasRef,
  canUndo,
  canRedo,
  setMode,
  setSelectedColor,
  setBrushSize,
  setDrawingTarget,
  setSelectedSensation,
  setTextSettings,
  setTextToPlace,
  onAddDrawingMark,
  onDrawingStrokeStart,
  onDrawingStrokeComplete,
  onAddToDrawingStroke,
  onBodyPartClick,
  onSensationClick,
  onErase,
  onWhiteboardFill,
  onTextPlace,
  onTextClick,
  onTextSave,
  onTextCancel,
  onTextDelete,
  onRotateLeft,
  onRotateRight,
  onResetAll,
  onUndo,
  onRedo,
  onEmotionsUpdate
}: BodyMapperLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringControlButtons, setIsHoveringControlButtons] = useState(false);
  const screenshotRef = useRef<ScreenshotCaptureHandle>(null);

  return (
    <div className="game-container">
      <div className="canvas-container">
        <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
          <BodyMapperCanvas
            mode={mode}
            selectedColor={selectedColor}
            brushSize={brushSize[0]}
            drawingTarget={drawingTarget}
            selectedSensation={selectedSensation}
            drawingMarks={drawingMarks}
            sensationMarks={sensationMarks}
            effects={[]}
            bodyPartColors={bodyPartColors}
            whiteboardBackground={whiteboardBackground}
            rotation={rotation}
            isActivelyDrawing={isActivelyDrawing}
            isHoveringControlButtons={isHoveringControlButtons}
            textMarks={textMarks}
            textToPlace={textToPlace}
            textSettings={textSettings}
            editingTextId={editingTextId}
            modelRef={modelRef}
            screenshotRef={screenshotRef}
            onAddDrawingMark={onAddDrawingMark}
            onDrawingStrokeStart={onDrawingStrokeStart}
            onDrawingStrokeComplete={onDrawingStrokeComplete}
            onAddToDrawingStroke={onAddToDrawingStroke}
            onBodyPartClick={onBodyPartClick}
            onSensationClick={onSensationClick}
            onSensationDeselect={() => setSelectedSensation(null)}
            onErase={onErase}
            onWhiteboardFill={onWhiteboardFill}
            onTextPlace={onTextPlace}
            onTextClick={onTextClick}
            onTextSave={onTextSave}
            onTextCancel={onTextCancel}
            onTextDelete={onTextDelete}
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
          drawingTarget={drawingTarget}
          mode={mode}
          isActivelyDrawing={isActivelyDrawing}
          onControlButtonsHover={setIsHoveringControlButtons}
          screenshotRef={screenshotRef}
          bodyPartColors={bodyPartColors}
          sensationMarks={sensationMarks}
        />
      </div>

      <div className={`controls-container ${isCollapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <div id="rightColumn">
          <BodyMapperControls
            ref={controlsRef}
            mode={mode}
            selectedColor={selectedColor}
            brushSize={brushSize}
            selectedSensation={selectedSensation}
            drawingTarget={drawingTarget}
            textSettings={textSettings}
            textToPlace={textToPlace}
            onModeChange={setMode}
            onColorChange={setSelectedColor}
            onBrushSizeChange={setBrushSize}
            onSensationChange={setSelectedSensation}
            onDrawingTargetChange={setDrawingTarget}
            onTextSettingsChange={setTextSettings}
            onTextToPlaceChange={setTextToPlace}
            onEmotionsUpdate={onEmotionsUpdate}
          />
        </div>
      </div>
      
      {/* Sensation placement popup */}
      <SensationPlacementPopup 
        selectedSensation={selectedSensation}
        isVisible={selectedSensation !== null}
      />
    </div>
  );
};
