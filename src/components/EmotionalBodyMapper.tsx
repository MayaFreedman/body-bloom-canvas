import React, { useRef, useState, useCallback } from 'react';
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

// Generate stable user ID outside component to prevent re-generation
const generateStableUserId = () => `user-${Date.now()}-${Math.random()}`;

const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  // Use useState to ensure stable user ID across renders
  const [currentUserId] = useState(() => generateStableUserId());

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
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    rotation,
    setRotation,
    handleStartDrawing,
    handleAddDrawingMark,
    handleFinishDrawing,
    handleSensationClick: localHandleSensationClick,
    handleBodyPartClick: baseHandleBodyPartClick,
    handleUndo,
    handleRedo,
    clearAll,
    canUndo,
    canRedo,
    addAction
  } = useEnhancedBodyMapperState({ currentUserId });

  const multiplayer = useMultiplayer(roomId);

  const {
    handleEmotionsUpdate,
    handleBodyPartClick,
    handleIncomingBodyPartFill,
    handleIncomingDrawingStroke,
    handleIncomingOptimizedStroke,
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
    restoreStroke: undefined,
    modelRef,
    clearAll,
    selectedColor,
    brushSize,
    addAction
  });

  const { handleRotateLeft, handleRotateRight } = useRotationHandlers({ 
    setRotation, 
    multiplayer 
  });

  // Combine local and multiplayer sensation handling
  const combinedSensationClick = useCallback((position: THREE.Vector3, sensation: any) => {
    localHandleSensationClick(position, sensation);
    handleSensationClick(position, sensation);
  }, [localHandleSensationClick, handleSensationClick]);

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
        sensationMarks={sensationMarks}
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
        onSensationClick={combinedSensationClick}
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
        setSensationMarks={setSensationMarks}
        setBodyPartColors={handleIncomingBodyPartFill}
        setRotation={setRotation}
        clearAll={clearAll}
        controlsRef={controlsRef}
        onIncomingOptimizedStroke={handleIncomingOptimizedStroke}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
