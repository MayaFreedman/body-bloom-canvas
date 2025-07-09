
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
    drawingTarget,
    setDrawingTarget,
    isActivelyDrawing,
    selectedSensation,
    setSelectedSensation,
    drawingMarks,
    sensationMarks,
    setSensationMarks,
    bodyPartColors,
    whiteboardBackground,
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
    handleWhiteboardFill,
    clearAll,
    canUndo,
    canRedo,
    restoreStroke,
    addAction,
    queryMarksInRadius,
    // Text functionality
    textMarks,
    textSettings,
    editingTextId,
    textToPlace,
    setTextToPlace,
    handleAddTextMark,
    handleUpdateTextMark,
    handleDeleteTextMark,
    handleStartTextEditing,
    handleStopTextEditing,
    setTextSettings
  } = useEnhancedBodyMapperState({
    currentUserId,
    isMultiplayer: multiplayer.isConnected,
    broadcastUndo: multiplayer.broadcastUndo,
    broadcastRedo: multiplayer.broadcastRedo,
    onBroadcastTextPlace: multiplayer.broadcastTextPlace,
    onBroadcastTextUpdate: multiplayer.broadcastTextUpdate,
    onBroadcastTextDelete: multiplayer.broadcastTextDelete
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
    addAction,
    setSelectedSensation
  });

  const { handleRotateLeft, handleRotateRight } = useRotationHandlers({ 
    setRotation, 
    multiplayer 
  });

  // Handle multiplayer erasing - broadcast to other users
  const handleMultiplayerErase = (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    console.log('🧹 MULTIPLAYER ERASE: Local', surface, 'erase requested at', center, 'with radius', radius);
    console.log('🧹 MULTIPLAYER ERASE: Is connected:', multiplayer.isConnected);
    
    const erasedMarks = handleErase(center, radius, surface);
    console.log('🧹 MULTIPLAYER ERASE: Local erase completed, erased', erasedMarks.length, 'marks from', surface);
    
    // Always broadcast erase events so other users see the changes
    if (multiplayer.isConnected) {
      console.log('🧹 MULTIPLAYER ERASE: Broadcasting', surface, 'erase to multiplayer');
      multiplayer.broadcastErase(center, radius, surface);
    }
  };

  // Handle incoming erase from other users - apply globally without recording to local history
  const handleIncomingErase = (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    console.log('🧹 INCOMING ERASE: Received multiplayer erase at', center, 'with radius', radius, 'on surface', surface);
    
    // Use the queryMarksInRadius function from the hook to find marks to erase
    const marksToErase = queryMarksInRadius(center, radius);
    
    if (marksToErase.length > 0) {
      console.log('🧹 INCOMING ERASE: Found', marksToErase.length, 'marks to erase on', surface);
      
      // Apply the erase operation using the hook's handleErase function with surface parameter
      // This will handle the actual removal from the stroke manager
      handleErase(center, radius, surface);
      
      console.log('🧹 INCOMING ERASE: Processed incoming erase, erased', marksToErase.length, 'marks from', surface);
    }
  };

  // Handle incoming sensation from other users - add to state only (no history)
  const handleIncomingSensation = (sensationMark: any) => {
    console.log('✨ INCOMING SENSATION: Received multiplayer sensation', sensationMark);
    
    // Add to visual state only - don't record incoming sensations in local action history
    setSensationMarks(prev => [...prev, sensationMark]);
    
    console.log('✨ INCOMING SENSATION: Added to state (no history entry for multiplayer)');
  };

  // Combine local and multiplayer sensation handling (no auto-deselect)
  const combinedSensationClick = (position: THREE.Vector3, sensation: any) => {
    console.log('✨ EmotionalBodyMapper - combinedSensationClick called with:', sensation.name, 'at position:', position);
    // Only call local handler once - it handles both state update and action history
    localHandleSensationClick(position, sensation);
    // Only broadcast to multiplayer, don't double-record to history
    handleSensationClick(position, sensation);
    // Sensation remains equipped after placement for multiple uses
  };

  const legacyDrawingMarks = drawingMarks.map(mark => ({
    id: mark.id,
    position: mark.position,
    color: mark.color,
    size: mark.size,
    surface: mark.surface  // ✅ FIXED: Include surface property
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
        drawingTarget={drawingTarget}
        isActivelyDrawing={isActivelyDrawing}
        selectedSensation={selectedSensation}
        drawingMarks={legacyDrawingMarks}
        sensationMarks={sensationMarks}
        textMarks={textMarks}
        modelRef={modelRef}
        textToPlace={textToPlace}
        bodyPartColors={bodyPartColors}
        whiteboardBackground={whiteboardBackground}
        rotation={rotation}
        textSettings={textSettings}
        editingTextId={editingTextId}
        controlsRef={controlsRef}
        canvasRef={canvasRef}
        canUndo={canUndo}
        canRedo={canRedo}
        setMode={setMode}
        setSelectedColor={setSelectedColor}
        setBrushSize={setBrushSize}
        setDrawingTarget={setDrawingTarget}
        setSelectedSensation={setSelectedSensation}
        setTextSettings={(settings) => setTextSettings(prev => ({ ...prev, ...settings }))}
        setTextToPlace={setTextToPlace}
        onAddDrawingMark={handleAddDrawingMark}
        onDrawingStrokeStart={handleDrawingStrokeStart}
        onDrawingStrokeComplete={handleDrawingStrokeComplete}
        onAddToDrawingStroke={handleAddToDrawingStroke}
        onBodyPartClick={handleBodyPartClick}
        onSensationClick={combinedSensationClick}
        onErase={handleMultiplayerErase}
        onWhiteboardFill={handleWhiteboardFill}
        onTextPlace={(position, surface) => handleAddTextMark(position, textToPlace || 'Sample Text', surface, selectedColor)}
        onTextClick={(textMark) => handleStartTextEditing(textMark.id)}
        onTextSave={(text) => editingTextId && handleUpdateTextMark(editingTextId, { text })}
        onTextCancel={handleStopTextEditing}
        onTextDelete={() => editingTextId && handleDeleteTextMark(editingTextId)}
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
        onIncomingSensation={handleIncomingSensation}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
