
import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  const [isRestoringState, setIsRestoringState] = useState(false);

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
    completedStrokes,
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

  // State synchronization functionality
  const stateSnapshot = useStateSnapshot({
    drawingMarks,
    sensationMarks,
    bodyPartColors,
    textMarks,
    whiteboardBackground,
    rotation,
    setDrawingMarks: (marks) => {
      // For state restoration, we need to directly set the marks via the stroke manager
      // DON'T call clearAll() as it may cause component remounting
      if (marks.length === 0) return;
      
      console.log('🔄 Restoring drawing marks without clearAll, count:', marks.length);
      console.log('🔄 Setting isRestoringState to true during mark restoration');
      
      // Sort marks by timestamp to reconstruct stroke order
      const sortedMarks = [...marks].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      // Group marks into strokes based on temporal proximity and spatial continuity
      const strokeGroups: Array<typeof marks> = [];
      let currentStroke: typeof marks = [];
      let lastTimestamp = 0;
      const STROKE_BREAK_THRESHOLD = 100; // ms between strokes
      
      sortedMarks.forEach(mark => {
        const markTimestamp = mark.timestamp || Date.now();
        
        // Start a new stroke if there's a significant time gap or if this is the first mark
        if (currentStroke.length === 0 || (markTimestamp - lastTimestamp) > STROKE_BREAK_THRESHOLD) {
          if (currentStroke.length > 0) {
            strokeGroups.push([...currentStroke]);
          }
          currentStroke = [mark];
        } else {
          currentStroke.push(mark);
        }
        
        lastTimestamp = markTimestamp;
      });
      
      // Don't forget the last stroke
      if (currentStroke.length > 0) {
        strokeGroups.push(currentStroke);
      }
      
      // Restore each stroke group
      strokeGroups.forEach((strokeMarks, index) => {
        const strokeId = `restored-stroke-${index}-${Date.now()}`;
        const enhancedMarks = strokeMarks.map(mark => ({
          ...mark,
          timestamp: mark.timestamp || Date.now(),
          strokeId: strokeId
        }));
        
        console.log(`🔄 Restoring stroke ${strokeId} with ${enhancedMarks.length} marks`);
        
        restoreStroke({
          id: strokeId,
          marks: enhancedMarks,
          surface: strokeMarks[0]?.surface || 'body',
          startTime: Math.min(...enhancedMarks.map(m => m.timestamp)),
          endTime: Math.max(...enhancedMarks.map(m => m.timestamp)),
          brushSize: strokeMarks[0]?.size || 3,
          color: strokeMarks[0]?.color || '#000000',
          isComplete: true
        });
      });
      
      // Log final state for debugging
      console.log('🔄 Restoration complete. Total strokes restored:', strokeGroups.length);
      
      // Debug: Check what's available in drawing marks after restoration
      setTimeout(() => {
        console.log('🔍 Drawing marks after restoration:', drawingMarks.length);
        console.log('🔍 First 3 drawing marks:', drawingMarks.slice(0, 3));
        console.log('🔍 Completed strokes count:', completedStrokes.length);
        console.log('🔍 First stroke details:', completedStrokes[0]);
        console.log('🔍 Total marks in first stroke:', completedStrokes[0]?.marks?.length);
      }, 100);
    },
    setSensationMarks,
    setBodyPartColors: (colors) => {
      Object.entries(colors).forEach(([partName, color]) => {
        baseHandleBodyPartClick(partName, color);
      });
    },
    setTextMarks: (marks) => {
      // Clear existing text marks and add new ones
      textMarks.forEach(mark => handleDeleteTextMark(mark.id));
      marks.forEach(mark => {
        handleAddTextMark(mark.position, mark.text, mark.surface, mark.color);
      });
    },
    setWhiteboardBackground: handleWhiteboardFill,
    setRotation,
    currentPlayerId: currentUserId
  });

  // Handle state requests from new players - only respond if we have content
  const handleStateRequest = useCallback(() => {
    // Don't respond to state requests if we're currently restoring state
    if (isRestoringState) {
      console.log('📤 Ignoring state request - currently restoring state');
      return;
    }
    
    if (multiplayer.isConnected) {
      // Add a small delay to ensure all reactive updates have completed
      setTimeout(() => {
        // Only respond if we have meaningful content to share
        const hasContent = drawingMarks.length > 0 || 
                          sensationMarks.length > 0 || 
                          Object.keys(bodyPartColors).length > 0 || 
                          textMarks.length > 0;
        
        if (hasContent) {
          console.log('📸 Sending state snapshot to new player (has content)');
          const snapshot = stateSnapshot.captureCurrentState();
          multiplayer.broadcastStateSnapshot(snapshot);
        } else {
          console.log('📸 No content to share, skipping state snapshot');
        }
      }, 100); // Small delay to ensure reactive updates complete
    }
  }, [multiplayer, stateSnapshot, drawingMarks.length, sensationMarks.length, Object.keys(bodyPartColors).length, textMarks.length, isRestoringState]);

  // Handle incoming state snapshots
  const handleStateSnapshot = useCallback((snapshot: any) => {
    try {
      console.log('📸 Received state snapshot:', snapshot);
      
      // Don't restore our own snapshot
      if (snapshot.playerId === currentUserId) {
        console.log('📸 Ignoring own snapshot');
        return;
      }
      
      if (stateSnapshot.validateSnapshot(snapshot)) {
        setIsRestoringState(true);
        console.log('🔄 Starting state restoration...');
        stateSnapshot.restoreFromSnapshot(snapshot);
        
        // Clear the restoration flag after a delay to ensure all reactive updates complete
        setTimeout(() => {
          setIsRestoringState(false);
          console.log('✅ State restoration complete');
        }, 200);
        
        console.log('✅ Successfully restored state from snapshot');
      } else {
        console.warn('⚠️ Invalid snapshot received, ignoring');
      }
    } catch (error) {
      console.error('❌ Error handling state snapshot:', error);
    }
  }, [stateSnapshot, currentUserId]);

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

  // Monitor when drawingMarks actually updates after restoration
  useEffect(() => {
    console.log('📊 DrawingMarks updated in EmotionalBodyMapper - count:', drawingMarks.length);
    if (drawingMarks.length > 0) {
      console.log('📊 First mark in updated drawingMarks:', drawingMarks[0]);
    }
  }, [drawingMarks.length]);

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
        onStateRequest={handleStateRequest}
        onStateSnapshot={handleStateSnapshot}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
