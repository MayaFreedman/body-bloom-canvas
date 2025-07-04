
import React, { useRef, useCallback } from 'react';
import { BodyMapperLayout } from './bodyMapper/BodyMapperLayout';
import { MultiplayerMessageHandler } from './bodyMapper/MultiplayerMessageHandler';
import { TopBanner } from './bodyMapper/TopBanner';
import { useEnhancedBodyMapperState } from '@/hooks/useEnhancedBodyMapperState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useMultiplayerDrawingHandlers } from '@/hooks/useMultiplayerDrawingHandlers';
import { useRotationHandlers } from '@/hooks/useRotationHandlers';
import * as THREE from 'three';

interface EmotionalBodyMapperProps {
  roomId?: string;
}

export const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = `user-${Date.now()}-${Math.random()}`;
  
  const bodyMapperState = useEnhancedBodyMapperState({ currentUserId });
  const multiplayer = useMultiplayer(roomId || null);
  
  const multiplayerHandlers = useMultiplayerDrawingHandlers({
    multiplayer,
    handleStartDrawing: bodyMapperState.handleStartDrawing,
    handleFinishDrawing: bodyMapperState.handleFinishDrawing,
    baseHandleBodyPartClick: bodyMapperState.handleBodyPartClick,
    restoreStroke: () => {}, // Not used anymore
    modelRef,
    clearAll: bodyMapperState.clearAll,
    selectedColor: bodyMapperState.selectedColor,
    brushSize: bodyMapperState.brushSize,
    addAction: bodyMapperState.addAction
  });

  const rotationHandlers = useRotationHandlers({
    multiplayer,
    rotation: bodyMapperState.rotation,
    setRotation: bodyMapperState.setRotation
  });

  const setBodyPartColors = useCallback((partName: string, color: string) => {
    console.log('🎨 Setting body part color:', partName, color);
    // This should trigger the body part color update
    bodyMapperState.handleBodyPartClick(partName, color);
  }, [bodyMapperState.handleBodyPartClick]);

  console.log('🔄 EmotionalBodyMapper rendering with:', {
    drawingMarks: bodyMapperState.drawingMarks.length,
    sensationMarks: bodyMapperState.sensationMarks.length,
    isConnected: multiplayer.isConnected,
    roomId
  });

  return (
    <div className="emotional-body-mapper">
      <TopBanner 
        isConnected={multiplayer.isConnected}
        isConnecting={multiplayer.isConnecting}
        playerCount={multiplayer.players.size}
        currentPlayerId={multiplayer.currentPlayerId}
        playerColor={multiplayer.playerColor}
      />
      
      <BodyMapperLayout
        mode={bodyMapperState.mode}
        selectedColor={bodyMapperState.selectedColor}
        brushSize={bodyMapperState.brushSize}
        selectedSensation={bodyMapperState.selectedSensation}
        drawingMarks={bodyMapperState.drawingMarks}
        sensationMarks={bodyMapperState.sensationMarks}
        bodyPartColors={bodyMapperState.bodyPartColors}
        rotation={bodyMapperState.rotation}
        modelRef={modelRef}
        controlsRef={controlsRef}
        canvasRef={canvasRef}
        canUndo={bodyMapperState.canUndo}
        canRedo={bodyMapperState.canRedo}
        setMode={bodyMapperState.setMode}
        setSelectedColor={bodyMapperState.setSelectedColor}
        setBrushSize={bodyMapperState.setBrushSize}
        setSelectedSensation={bodyMapperState.setSelectedSensation}
        onAddDrawingMark={bodyMapperState.handleAddDrawingMark}
        onDrawingStrokeStart={multiplayerHandlers.handleDrawingStrokeStart}
        onDrawingStrokeComplete={multiplayerHandlers.handleDrawingStrokeComplete}
        onAddToDrawingStroke={multiplayerHandlers.handleAddToDrawingStroke}
        onBodyPartClick={multiplayerHandlers.handleBodyPartClick}
        onSensationClick={bodyMapperState.handleSensationClick}
        onRotateLeft={rotationHandlers.handleRotateLeft}
        onRotateRight={rotationHandlers.handleRotateRight}
        onResetAll={multiplayerHandlers.handleResetAll}
        onUndo={bodyMapperState.handleUndo}
        onRedo={bodyMapperState.handleRedo}
        onEmotionsUpdate={multiplayerHandlers.handleEmotionsUpdate}
      />

      {/* CRITICAL: Pass the stroke handler to MultiplayerMessageHandler */}
      <MultiplayerMessageHandler
        room={multiplayer.room}
        modelRef={modelRef}
        setDrawingMarks={() => {}} // Legacy support
        setSensationMarks={bodyMapperState.setSensationMarks}
        setBodyPartColors={setBodyPartColors}
        setRotation={bodyMapperState.setRotation}
        clearAll={bodyMapperState.clearAll}
        controlsRef={controlsRef}
        onIncomingOptimizedStroke={multiplayerHandlers.handleIncomingOptimizedStroke}
      />
    </div>
  );
};
