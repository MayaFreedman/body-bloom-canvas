
import React, { useRef, useCallback } from 'react';
import { BodyMapperCanvas } from './bodyMapper/BodyMapperCanvas';
import { BodyMapperControls } from './bodyMapper/BodyMapperControls';
import { TopBanner } from './bodyMapper/TopBanner';
import { ControlButtons } from './bodyMapper/ControlButtons';
import { MultiplayerMessageHandler } from './bodyMapper/MultiplayerMessageHandler';
import { useEnhancedBodyMapperState } from '@/hooks/useEnhancedBodyMapperState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { SensationMark } from '@/types/bodyMapperTypes';
import * as THREE from 'three';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';

interface EmotionalBodyMapperProps {
  roomId: string | null;
}

const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  // Generate a unique user ID for this session
  const currentUserId = React.useMemo(() => `user-${Date.now()}-${Math.random()}`, []);

  // Use the enhanced hook for state management with user ID
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
    canRedo
  } = useEnhancedBodyMapperState({ currentUserId });

  // Initialize multiplayer
  const multiplayer = useMultiplayer(roomId);

  // Handle emotion updates and broadcast to multiplayer
  const handleEmotionsUpdate = useCallback((updateData: any) => {
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'emotionUpdate',
        data: updateData
      });
    }
  }, [multiplayer]);

  // Synchronized rotation handlers that broadcast to all users
  const handleRotateLeft = useCallback(() => {
    setRotation(prev => prev - Math.PI / 2);
    
    // Broadcast rotation to all users
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'left' }
      });
    }
  }, [setRotation, multiplayer]);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => prev + Math.PI / 2);
    
    // Broadcast rotation to all users
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'right' }
      });
    }
  }, [setRotation, multiplayer]);

  // Enhanced handlers that include multiplayer broadcasting
  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    baseHandleBodyPartClick(partName, color);
    
    // Broadcast to multiplayer
    if (multiplayer.isConnected) {
      multiplayer.broadcastBodyPartFill({ partName, color });
    }
  }, [baseHandleBodyPartClick, multiplayer]);

  // Handler for incoming multiplayer body part fills
  const handleIncomingBodyPartFill = useCallback((partName: string, color: string) => {
    console.log('📨 Handling incoming body part fill:', partName, color);
    // Use the same handler but without broadcasting to avoid loops
    baseHandleBodyPartClick(partName, color);
  }, [baseHandleBodyPartClick]);

  // Handler for incoming multiplayer drawing strokes
  const handleIncomingDrawingStroke = useCallback((stroke: any) => {
    console.log('📨 Handling incoming drawing stroke:', stroke);
    
    if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
      console.warn('⚠️ Invalid stroke data:', stroke);
      return;
    }
    
    // Convert world positions to local positions and create all marks at once
    const modelGroup = modelRef.current;
    if (modelGroup) {
      console.log('🎨 Processing', stroke.points.length, 'points from incoming stroke');
      
      // Process points and create marks with interpolation
      for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint: WorldDrawingPoint = stroke.points[i];
        const worldPos = new THREE.Vector3(
          currentPoint.worldPosition.x,
          currentPoint.worldPosition.y,
          currentPoint.worldPosition.z
        );
        
        const localPos = new THREE.Vector3();
        modelGroup.worldToLocal(localPos.copy(worldPos));
        
        // Add the current point using the enhanced state system
        const mark = {
          id: currentPoint.id,
          position: localPos,
          color: currentPoint.color,
          size: currentPoint.size
        };
        
        handleAddDrawingMark(mark);
        
        // Interpolate to the next point if it exists and is on the same body part
        if (i < stroke.points.length - 1) {
          const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
          const nextWorldPos = new THREE.Vector3(
            nextPoint.worldPosition.x,
            nextPoint.worldPosition.y,
            nextPoint.worldPosition.z
          );
          
          // Only interpolate if both points are on the same body part
          if (currentPoint.bodyPart === nextPoint.bodyPart) {
            const distance = worldPos.distanceTo(nextWorldPos);
            const steps = Math.max(1, Math.floor(distance * 50));
            
            if (steps > 1) {
              // Add interpolated marks
              for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const interpolatedWorldPos = new THREE.Vector3().lerpVectors(worldPos, nextWorldPos, t);
                const interpolatedLocalPos = new THREE.Vector3();
                modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedWorldPos));
                
                const interpolatedMark = {
                  id: `interpolated-${currentPoint.id}-${j}`,
                  position: interpolatedLocalPos,
                  color: currentPoint.color,
                  size: currentPoint.size
                };
                handleAddDrawingMark(interpolatedMark);
              }
            }
          }
        }
      }
      
      console.log(`✅ Successfully processed incoming drawing stroke`);
    }
  }, [handleAddDrawingMark, modelRef]);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => {
    // For now, just log - sensation functionality needs to be integrated with enhanced state
    console.log('Sensation clicked:', position, sensation);
    
    // Broadcast to multiplayer
    if (multiplayer.isConnected) {
      const sensationMark = {
        id: `sensation-${Date.now()}-${Math.random()}`,
        position,
        icon: sensation.icon,
        color: sensation.color,
        size: 0.1
      };
      multiplayer.broadcastSensation(sensationMark);
    }
  }, [multiplayer]);

  // Enhanced reset handler that broadcasts to all users
  const handleResetAll = useCallback(() => {
    clearAll();
    
    // Broadcast reset to all connected users
    if (multiplayer.isConnected) {
      multiplayer.broadcastReset();
    }
  }, [clearAll, multiplayer]);

  const handleAddToDrawingStroke = useCallback((worldPoint: WorldDrawingPoint) => {
    if (multiplayer.isConnected) {
      multiplayer.addToDrawingStroke(worldPoint);
    }
  }, [multiplayer]);

  const handleDrawingStrokeStart = useCallback(() => {
    handleStartDrawing();
    if (multiplayer.isConnected) {
      multiplayer.startDrawingStroke();
    }
  }, [handleStartDrawing, multiplayer]);

  const handleDrawingStrokeComplete = useCallback(() => {
    handleFinishDrawing();
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke();
    }
  }, [handleFinishDrawing, multiplayer]);

  // Convert drawing marks to legacy format for canvas
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

      <div className="game-container">
        {/* Canvas Area */}
        <div className="canvas-container">
          <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
            <BodyMapperCanvas
              mode={mode}
              selectedColor={selectedColor}
              brushSize={brushSize[0]}
              selectedSensation={selectedSensation}
              drawingMarks={legacyDrawingMarks}
              sensationMarks={[]} // Empty for now
              effects={[]} // Empty for now
              bodyPartColors={bodyPartColors}
              rotation={rotation}
              modelRef={modelRef}
              onAddDrawingMark={(mark) => handleAddDrawingMark(mark)}
              onDrawingStrokeStart={handleDrawingStrokeStart}
              onDrawingStrokeComplete={handleDrawingStrokeComplete}
              onAddToDrawingStroke={handleAddToDrawingStroke}
              onBodyPartClick={handleBodyPartClick}
              onSensationClick={handleSensationClick}
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
            />
          </div>
          
          <ControlButtons 
            onResetAll={handleResetAll}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            canvasRef={canvasRef}
          />
        </div>

        {/* Controls Area */}
        <div className="controls-container">
          <div id="rightColumn">
            <BodyMapperControls
              ref={controlsRef}
              mode={mode}
              selectedColor={selectedColor}
              brushSize={brushSize}
              selectedSensation={selectedSensation}
              onModeChange={setMode}
              onColorChange={setSelectedColor}
              onBrushSizeChange={setBrushSize}
              onSensationChange={setSelectedSensation}
              onEmotionsUpdate={handleEmotionsUpdate}
            />
          </div>
        </div>
      </div>

      <MultiplayerMessageHandler
        room={multiplayer.room}
        modelRef={modelRef}
        setDrawingMarks={handleIncomingDrawingStroke} // Now properly connected!
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
