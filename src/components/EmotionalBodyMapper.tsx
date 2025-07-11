
import React, { useRef, useState, useCallback } from 'react';
import { BottomBrand } from './bodyMapper/BottomBrand';
import { MultiplayerMessageHandler } from './bodyMapper/MultiplayerMessageHandler';
import { BodyMapperLayout } from './bodyMapper/BodyMapperLayout';
import { useEnhancedBodyMapperState } from '@/hooks/useEnhancedBodyMapperState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useMultiplayerDrawingHandlers } from '@/hooks/useMultiplayerDrawingHandlers';
import { useRotationHandlers } from '@/hooks/useRotationHandlers';
import { useStateSnapshot } from '@/hooks/useStateSnapshot';
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
    setTextSettings,
    // Stroke manager for state snapshots
    strokeManager
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

  // State snapshot functionality
  const handleRestoreState = useCallback((snapshot: any) => {
    console.log('🔄 Restoring state from snapshot:', snapshot);
    
    const { data } = snapshot;
    if (!data) return;

    // Clear existing state first
    strokeManager.getAllStrokes().forEach(stroke => {
      strokeManager.removeStroke(stroke.id);
    });

    // Restore drawing strokes - new stroke-based approach
    if (data.drawingStrokes && Array.isArray(data.drawingStrokes)) {
      console.log('🔄 Restoring drawing strokes from state snapshot:', data.drawingStrokes.length);
      
      data.drawingStrokes.forEach((stroke: any) => {
        console.log('🔄 Restoring stroke from snapshot:', stroke.id);
        strokeManager.restoreStroke(stroke);
      });
      
      // CRITICAL: Verify marks are available after restoration (with delay to ensure state updates)
      setTimeout(() => {
        console.log('🎨 Delayed check - Total marks after restoration:', strokeManager.getAllMarks().length, 'strokes:', strokeManager.getAllStrokes().length);
        console.log('🎨 Stroke details:', strokeManager.getAllStrokes().map(s => ({ id: s.id, markCount: s.marks.length })));
      }, 100);
      
      console.log('✅ Restored', data.drawingStrokes.length, 'strokes from snapshot');
    }
    // Legacy support for old mark-based snapshots
    else if (data.drawingMarks && Array.isArray(data.drawingMarks)) {
      console.log('🔄 Restoring legacy drawing marks from state snapshot:', data.drawingMarks.length);
      
      // Group marks by stroke ID to reconstruct strokes
      const strokeGroups: { [strokeId: string]: any[] } = {};
      data.drawingMarks.forEach((mark: any) => {
        const strokeId = mark.strokeId || `stroke-${Date.now()}-${Math.random()}`;
        if (!strokeGroups[strokeId]) {
          strokeGroups[strokeId] = [];
        }
        strokeGroups[strokeId].push(mark);
      });

      // Restore each stroke
      Object.entries(strokeGroups).forEach(([strokeId, marks]) => {
        console.log('🔄 Restoring legacy stroke from snapshot:', strokeId, 'with marks:', marks.length);
        if (marks.length > 0) {
          const firstMark = marks[0];
          strokeManager.restoreStroke({
            id: strokeId,
            marks,
            userId: data.playerId || 'unknown',
            startTime: Date.now(),
            endTime: Date.now(),
            brushSize: firstMark.size || 0.015,
            color: firstMark.color || '#ffeb3b',
            isComplete: true
          });
        }
      });
    }

    // Restore other state
    if (data.sensationMarks) setSensationMarks(data.sensationMarks);
    if (data.bodyPartColors) {
      Object.entries(data.bodyPartColors).forEach(([partName, color]) => {
        baseHandleBodyPartClick(partName, color as string);
      });
    }
    if (data.whiteboardBackground) handleWhiteboardFill(data.whiteboardBackground);
    if (data.modelRotation !== undefined) setRotation(data.modelRotation);
    if (data.emotions) setEmotions(data.emotions);

    console.log('✅ Successfully restored state from snapshot');
  }, [setSensationMarks, baseHandleBodyPartClick, handleWhiteboardFill, setRotation, setEmotions, strokeManager]);

  const { broadcastStateSnapshot, requestStateSnapshot } = useStateSnapshot({
    currentUserId,
    drawingStrokes: strokeManager.getAllStrokes(),
    sensationMarks,
    bodyPartColors,
    textMarks,
    whiteboardBackground,
    rotation,
    emotions,
    multiplayer,
    onRestoreState: handleRestoreState
  });

  // Handle state requests from other users
  const handleStateRequest = useCallback((requestData: any) => {
    console.log('📞 Received state request from:', requestData.playerId);
    if (requestData.playerId !== currentUserId) {
      // Only broadcast state if we have some content to share
      const hasContent = strokeManager.getAllStrokes().length > 0 || sensationMarks.length > 0 || 
                        Object.keys(bodyPartColors).length > 0 || textMarks.length > 0;
      if (hasContent) {
        console.log('📸 Broadcasting state in response to request');
        broadcastStateSnapshot();
      }
    }
  }, [currentUserId, strokeManager, sensationMarks, bodyPartColors, textMarks, broadcastStateSnapshot]);

  const handleStateSnapshot = useCallback((snapshot: any) => {
    console.log('📸 Received state snapshot:', snapshot);
    if (snapshot.playerId !== currentUserId) {
      handleRestoreState(snapshot);
    }
  }, [currentUserId, handleRestoreState]);

  // Set up global handlers for message handler
  React.useEffect(() => {
    (window as any).handleStateRequest = handleStateRequest;
    (window as any).handleStateSnapshot = handleStateSnapshot;
    
    return () => {
      delete (window as any).handleStateRequest;
      delete (window as any).handleStateSnapshot;
    };
  }, [handleStateRequest, handleStateSnapshot]);

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
