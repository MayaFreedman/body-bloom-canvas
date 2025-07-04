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

  const multiplayer = useMultiplayer(roomId);

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
    setDrawingMarks,
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
    handleErase,
    handleUndo,
    handleRedo,
    handleIncomingUndo,
    handleIncomingRedo,
    clearAll,
    canUndo,
    canRedo,
    restoreStroke,
    addAction
  } = useEnhancedBodyMapperState({ 
    currentUserId,
    isMultiplayer: multiplayer.isConnected,
    broadcastUndo: multiplayer.broadcastUndo,
    broadcastRedo: multiplayer.broadcastRedo
  });

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
    restoreStroke,
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

  // Handle multiplayer erasing
  const handleMultiplayerErase = (center: THREE.Vector3, radius: number) => {
    console.log('🧹 MULTIPLAYER ERASE: Local erase requested at', center, 'with radius', radius);
    console.log('🧹 MULTIPLAYER ERASE: Is connected:', multiplayer.isConnected);
    
    const erasedMarks = handleErase(center, radius);
    console.log('🧹 MULTIPLAYER ERASE: Local erase completed, erased', erasedMarks.length, 'marks');
    
    if (multiplayer.isConnected) {
      console.log('🧹 MULTIPLAYER ERASE: Broadcasting erase to multiplayer');
      multiplayer.broadcastErase(center, radius);
    } else {
      console.log('🧹 MULTIPLAYER ERASE: Not connected, skipping broadcast');
    }
  };

  const handleIncomingErase = (center: THREE.Vector3, radius: number) => {
    console.log('🧹 INCOMING ERASE: Received multiplayer erase at', center, 'with radius', radius);
    
    // Remove marks visually from the drawing marks state
    setDrawingMarks(prevMarks => {
      const marksToKeep = prevMarks.filter(mark => {
        const distance = mark.position.distanceTo(center);
        const shouldKeep = distance > radius + mark.size;
        if (!shouldKeep) {
          console.log('🧹 INCOMING ERASE: Removing visual mark', mark.id, 'at distance', distance);
        }
        return shouldKeep;
      });
      
      const removedCount = prevMarks.length - marksToKeep.length;
      console.log('🧹 INCOMING ERASE: Removed', removedCount, 'visual marks from display');
      
      return marksToKeep;
    });
    
    // Also run the regular erase operation for any local stroke manager cleanup
    const erasedMarks = handleErase(center, radius);
    console.log('🧹 INCOMING ERASE: Processed stroke manager erase, erased', erasedMarks.length, 'marks');
  };

  // Combine local and multiplayer sensation handling
  const combinedSensationClick = (position: THREE.Vector3, sensation: any) => {
    localHandleSensationClick(position, sensation);
    handleSensationClick(position, sensation);
  };

  const legacyDrawingMarks = drawingMarks.map(mark => ({
    id: mark.id,
    position: mark.position,
    color: mark.color,
    size: mark.size
  }));

  console.log('EmotionalBodyMapper - canUndo:', canUndo, 'canRedo:', canRedo);

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
        onErase={handleMultiplayerErase}
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
        onIncomingUndo={handleIncomingUndo}
        onIncomingRedo={handleIncomingRedo}
        onIncomingErase={handleIncomingErase}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
