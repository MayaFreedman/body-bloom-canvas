
import React, { useRef, useState, useCallback } from 'react';
import { BottomBrand } from './bodyMapper/BottomBrand';
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

  // Manage emotions state locally
  const [emotions, setEmotions] = useState([
    { color: '#ffeb3b', name: 'Joy' },
    { color: '#2196f3', name: 'Sadness' },
    { color: '#f44336', name: 'Anger' },
    { color: '#4caf50', name: '' },
    { color: '#9c27b0', name: '' },
    { color: '#ff9800', name: '' }
  ]);

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

  // Handle emotions updates from controls - now that handleEmotionsUpdate is available
  const handleLocalEmotionsUpdate = useCallback((updateData: any) => {
    switch (updateData.type) {
      case 'emotionsInit':
        if (updateData.emotions) {
          setEmotions(updateData.emotions);
        }
        break;
      case 'emotionColorChange':
        if (updateData.index !== undefined && updateData.value) {
          setEmotions(prev => {
            const newEmotions = [...prev];
            newEmotions[updateData.index].color = updateData.value;
            return newEmotions;
          });
        }
        break;
      case 'emotionNameChange':
        if (updateData.index !== undefined && updateData.value !== undefined) {
          setEmotions(prev => {
            const newEmotions = [...prev];
            newEmotions[updateData.index].name = updateData.value;
            return newEmotions;
          });
        }
        break;
      case 'addEmotion':
        if (updateData.emotion) {
          setEmotions(prev => [...prev, updateData.emotion]);
        }
        break;
      case 'deleteEmotion':
        if (updateData.index !== undefined) {
          setEmotions(prev => prev.filter((_, i) => i !== updateData.index));
        }
        break;
    }
    
    // Also broadcast to multiplayer
    handleEmotionsUpdate(updateData);
  }, [handleEmotionsUpdate]);

  // Handle multiplayer erasing - broadcast to other users
  const handleMultiplayerErase = (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    const erasedMarks = handleErase(center, radius, surface);
    
    // Always broadcast erase events so other users see the changes
    if (multiplayer.isConnected) {
      multiplayer.broadcastErase(center, radius, surface);
    }
  };

  // Handle incoming erase from other users - apply globally without recording to local history
  const handleIncomingErase = (center: THREE.Vector3, radius: number, surface: 'body' | 'whiteboard' = 'body') => {
    // Use the queryMarksInRadius function from the hook to find marks to erase
    const marksToErase = queryMarksInRadius(center, radius);
    
    if (marksToErase.length > 0) {
      // Apply the erase operation using the hook's handleErase function with surface parameter
      // This will handle the actual removal from the stroke manager
      handleErase(center, radius, surface);
    }
  };

  // Handle incoming sensation from other users - add to state only (no history)
  const handleIncomingSensation = (sensationMark: any) => {
    // Add to visual state only - don't record incoming sensations in local action history
    setSensationMarks(prev => [...prev, sensationMark]);
  };

  // Handle incoming custom effects from multiplayer
  const handleIncomingCustomEffect = useCallback((customEffect: any) => {
    console.log('🔥 EmotionalBodyMapper - Handling incoming custom effect:', customEffect);
    // Forward to the controls component to handle
    if (controlsRef.current?.handleIncomingCustomEffect) {
      controlsRef.current.handleIncomingCustomEffect(customEffect);
    }
  }, []);

  // Handle custom effect creation and broadcast
  const handleCustomEffectCreated = useCallback((customEffect: any) => {
    console.log('🔥 EmotionalBodyMapper - Broadcasting custom effect:', customEffect);
    if (multiplayer.isConnected) {
      multiplayer.broadcastCustomEffect(customEffect);
    }
  }, [multiplayer]);

  // Combine local and multiplayer sensation handling (no auto-deselect)
  const combinedSensationClick = (position: THREE.Vector3, sensation: any) => {
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

  

  return (
    <div style={{ height: '100vh', width: '100%' }}>
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
        emotions={emotions}
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
        onTextPlace={(position, surface) => handleAddTextMark(position, textToPlace || '', surface, selectedColor)}
        onTextClick={(textMark) => handleStartTextEditing(textMark.id)}
        onTextSave={(text) => editingTextId && handleUpdateTextMark(editingTextId, { text })}
        onTextCancel={handleStopTextEditing}
        onTextDelete={() => editingTextId && handleDeleteTextMark(editingTextId)}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onResetAll={handleResetAll}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onEmotionsUpdate={handleLocalEmotionsUpdate}
        onCustomEffectCreated={handleCustomEffectCreated}
        onIncomingCustomEffect={handleIncomingCustomEffect}
      />

      <BottomBrand
        isConnected={multiplayer.isConnected}
        isConnecting={multiplayer.isConnecting}
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
        onIncomingCustomEffect={handleIncomingCustomEffect}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
