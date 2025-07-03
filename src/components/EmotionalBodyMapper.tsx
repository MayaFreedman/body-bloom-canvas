
import React, { useRef } from 'react';
import { TopBanner } from './bodyMapper/TopBanner';
import { MultiplayerMessageHandler } from './bodyMapper/MultiplayerMessageHandler';
import { BodyMapperLayout } from './bodyMapper/BodyMapperLayout';
import { useEnhancedBodyMapperState } from '@/hooks/useEnhancedBodyMapperState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useMultiplayerDrawingHandlers } from '@/hooks/useMultiplayerDrawingHandlers';
import { useRotationHandlers } from '@/hooks/useRotationHandlers';
import * as THREE from 'three';

interface EmotionalBodyMapperProps {
  roomId: string | null;
}

const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  const currentUserId = React.useMemo(() => `user-${Date.now()}-${Math.random()}`, []);

  const {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedSensation,
    setSelectedSensation,
    drawingMarks,
    bodyPartColors,
    rotation,
    setRotation,
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing,
    handleBodyPartClick: baseHandleBodyPartClick,
    handleUndo,
    handleRedo,
    clearAll,
    canUndo,
    canRedo,
    restoreStroke
  } = useEnhancedBodyMapperState({ currentUserId });

  const multiplayer = useMultiplayer(roomId);

  const {
    handleEmotionsUpdate,
    handleBodyPartClick,
    handleIncomingBodyPartFill,
    handleIncomingDrawingStroke,
    handleSensationClick,
    handleResetAll,
    handleAddToDrawingStroke,
    handleDrawingStrokeStart,
    handleDrawingStrokeComplete
  } = useMultiplayerDrawingHandlers({
    multiplayer,
    handleStartDrawing,
    handleFinishDrawing,
    baseHandleBodyPartClick,
    restoreStroke,
    modelRef,
    clearAll
  });

  const { handleRotateLeft, handleRotateRight } = useRotationHandlers({ 
    setRotation, 
    multiplayer 
  });

  const legacyDrawingMarks = drawingMarks.map(mark => ({
    id: mark.id,
    position: mark.position,
    color: mark.color,
    size: mark.size
  }));

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <TopBanner 
        roomId={roomId}
        isConnected={multiplayer.isConnected}
        isConnecting={multiplayer.isConnecting}
      />

      <BodyMapperLayout
        mode={mode}
        selectedColor={selectedColor}
        brushSize={brushSize}
        selectedSensation={selectedSensation}
        drawingMarks={legacyDrawingMarks}
        bodyPartColors={bodyPartColors}
        rotation={rotation}
        modelRef={modelRef}
        controlsRef={controlsRef}
        canvasRef={canvasRef}
        canUndo={canUndo}
        canRedo={canRedo}
        setMode={setMode}
        setSelectedColor={setSelectedColor}
        setBrushSize={setBrushSize}
        setSelectedSensation={setSelectedSensation}
        onAddDrawingMark={handleAddDrawingMark}
        onDrawingStrokeStart={handleDrawingStrokeStart}
        onDrawingStrokeComplete={handleDrawingStrokeComplete}
        onAddToDrawingStroke={handleAddToDrawingStroke}
        onBodyPartClick={handleBodyPartClick}
        onSensationClick={handleSensationClick}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onResetAll={handleResetAll}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onEmotionsUpdate={handleEmotionsUpdate}
      />

      <MultiplayerMessageHandler
        room={multiplayer.room}
        modelRef={modelRef}
        setDrawingMarks={handleIncomingDrawingStroke}
        setSensationMarks={() => {}}
        setBodyPartColors={handleIncomingBodyPartFill}
        setRotation={setRotation}
        clearAll={clearAll}
        controlsRef={controlsRef}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
