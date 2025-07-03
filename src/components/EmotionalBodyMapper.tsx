
import React, { useRef, useCallback } from 'react';
import { BodyMapperCanvas } from './bodyMapper/BodyMapperCanvas';
import { BodyMapperControls } from './bodyMapper/BodyMapperControls';
import { TopBanner } from './bodyMapper/TopBanner';
import { ControlButtons } from './bodyMapper/ControlButtons';
import { MultiplayerMessageHandler } from './bodyMapper/MultiplayerMessageHandler';
import { useBodyMapperState } from '@/hooks/useBodyMapperState';
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

  // Use the custom hook for state management
  const {
    mode,
    setMode,
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedSensation,
    setSelectedSensation,
    lineStrokes,
    setLineStrokes,
    sensationMarks,
    setSensationMarks,
    effects,
    bodyPartColors,
    setBodyPartColors,
    rotation,
    setRotation,
    handleAddStroke,
    handleBodyPartClick: baseHandleBodyPartClick,
    handleSensationClick: baseHandleSensationClick,
    rotateLeft: baseRotateLeft,
    rotateRight: baseRotateRight,
    clearAll
  } = useBodyMapperState();

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
    baseRotateLeft();
    
    // Broadcast rotation to all users
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'left' }
      });
    }
  }, [baseRotateLeft, multiplayer]);

  const handleRotateRight = useCallback(() => {
    baseRotateRight();
    
    // Broadcast rotation to all users
    if (multiplayer.isConnected && multiplayer.room) {
      multiplayer.room.send('broadcast', {
        type: 'modelRotation',
        data: { direction: 'right' }
      });
    }
  }, [baseRotateRight, multiplayer]);

  // Enhanced handlers that include multiplayer broadcasting
  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    baseHandleBodyPartClick(partName, color);
    
    // Broadcast to multiplayer
    if (multiplayer.isConnected) {
      multiplayer.broadcastBodyPartFill({ partName, color });
    }
  }, [baseHandleBodyPartClick, multiplayer]);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => {
    baseHandleSensationClick(position, sensation);
    
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
  }, [baseHandleSensationClick, multiplayer]);

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
    if (multiplayer.isConnected) {
      multiplayer.startDrawingStroke();
    }
  }, [multiplayer]);

  const handleDrawingStrokeComplete = useCallback(() => {
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke();
    }
  }, [multiplayer]);

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
              lineStrokes={lineStrokes}
              sensationMarks={sensationMarks}
              effects={effects}
              bodyPartColors={bodyPartColors}
              rotation={rotation}
              modelRef={modelRef}
              onAddStroke={handleAddStroke}
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
        setDrawingMarks={setLineStrokes}
        setSensationMarks={setSensationMarks}
        setBodyPartColors={setBodyPartColors}
        setRotation={setRotation}
        clearAll={clearAll}
        controlsRef={controlsRef}
      />
    </div>
  );
};

export default EmotionalBodyMapper;
