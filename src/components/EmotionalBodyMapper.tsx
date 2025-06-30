import React, { useRef, useCallback, useEffect } from 'react';
import { RotateCcw, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BodyMapperCanvas } from './bodyMapper/BodyMapperCanvas';
import { BodyMapperControls } from './bodyMapper/BodyMapperControls';
import { useBodyMapperState } from '@/hooks/useBodyMapperState';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { SensationMark } from '@/types/bodyMapperTypes';
import html2canvas from 'html2canvas';
import * as THREE from 'three';

interface CustomEmotion {
  color: string;
  name: string;
}

interface EmotionalBodyMapperProps {
  roomId: string | null;
}

const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);

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
    drawingMarks,
    setDrawingMarks,
    sensationMarks,
    setSensationMarks,
    effects,
    bodyPartColors,
    setBodyPartColors,
    rotation,
    handleAddDrawingMark,
    handleBodyPartClick: baseHandleBodyPartClick,
    handleSensationClick: baseHandleSensationClick,
    rotateLeft,
    rotateRight,
    clearAll
  } = useBodyMapperState();

  // Initialize multiplayer
  const multiplayer = useMultiplayer(roomId);

  // Handle emotion updates and broadcast to multiplayer
  const handleEmotionsUpdate = useCallback((emotions: CustomEmotion[]) => {
    if (multiplayer.isConnected) {
      const server = multiplayer.room;
      if (server) {
        server.send('broadcast', {
          type: 'emotionsUpdate',
          data: emotions
        });
      }
    }
  }, [multiplayer]);

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

  const handleAddToDrawingStroke = useCallback((worldPosition: THREE.Vector3) => {
    if (multiplayer.isConnected) {
      multiplayer.addToDrawingStroke(worldPosition);
    }
  }, [multiplayer]);

  const handleDrawingStrokeStart = useCallback(() => {
    if (multiplayer.isConnected) {
      multiplayer.startDrawingStroke();
    }
  }, [multiplayer]);

  const handleDrawingStrokeComplete = useCallback(() => {
    if (multiplayer.isConnected) {
      multiplayer.finishDrawingStroke(selectedColor, brushSize[0] / 100);
    }
  }, [multiplayer, selectedColor, brushSize]);

  // Handle multiplayer messages
  useEffect(() => {
    if (multiplayer.room) {
      const handleBroadcast = (message: any) => {
        try {
          console.log('📨 Received broadcast message:', message);
          
          if (!message || !message.type) {
            console.warn('⚠️ Invalid message format:', message);
            return;
          }

          // Handle both 'data' and 'action' properties for backward compatibility
          const messageData = message.data || message.action;
          if (!messageData) {
            console.warn('⚠️ No data/action in message:', message);
            return;
          }

          switch (message.type) {
            case 'emotionsUpdate': {
              // Handle emotion updates from other users
              console.log('🎨 Processing emotions update:', messageData);
              // Note: In a full implementation, you'd want to sync this with local state
              // For now, we'll just log it since the UI updates are handled locally
              break;
            }
            case 'drawingStroke': {
              const stroke = messageData;
              console.log('🎨 Processing drawing stroke:', stroke);
              
              if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
                console.warn('⚠️ Invalid stroke data:', stroke);
                return;
              }
              
              // Convert world coordinates to local coordinates and add as marks
              const modelGroup = modelRef.current;
              if (modelGroup) {
                stroke.points.forEach((point: any, index: number) => {
                  try {
                    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' || typeof point.z !== 'number') {
                      console.warn('⚠️ Invalid point data:', point);
                      return;
                    }
                    
                    // Convert world position to local position relative to the model
                    const worldPos = new THREE.Vector3(point.x, point.y, point.z);
                    const localPos = new THREE.Vector3();
                    modelGroup.worldToLocal(localPos.copy(worldPos));
                    
                    const mark = {
                      id: `${stroke.id}-${index}`,
                      position: localPos,
                      color: stroke.color || '#ff6b6b',
                      size: stroke.size || 0.1
                    };
                    setDrawingMarks(prev => [...prev, mark]);
                  } catch (pointError) {
                    console.error('❌ Error processing point:', pointError, point);
                  }
                });
              }
              break;
            }
            case 'sensationPlace': {
              const sensation = messageData;
              console.log('✨ Processing sensation:', sensation);
              
              if (!sensation || !sensation.position || !sensation.id) {
                console.warn('⚠️ Invalid sensation data:', sensation);
                return;
              }
              
              try {
                const newSensationMark: SensationMark = {
                  id: sensation.id,
                  position: new THREE.Vector3(
                    sensation.position.x || 0, 
                    sensation.position.y || 0, 
                    sensation.position.z || 0
                  ),
                  icon: sensation.icon || 'Star',
                  color: sensation.color || '#ff6b6b',
                  size: sensation.size || 0.1
                };
                setSensationMarks(prev => [...prev, newSensationMark]);
              } catch (sensationError) {
                console.error('❌ Error processing sensation:', sensationError, sensation);
              }
              break;
            }
            case 'bodyPartFill': {
              const fill = messageData;
              console.log('🎨 Processing body part fill:', fill);
              
              if (!fill || !fill.partName || !fill.color) {
                console.warn('⚠️ Invalid fill data:', fill);
                return;
              }
              
              try {
                setBodyPartColors(prev => ({
                  ...prev,
                  [fill.partName]: fill.color
                }));
                console.log('✅ Successfully applied body part fill:', fill.partName, fill.color);
              } catch (fillError) {
                console.error('❌ Error applying body part fill:', fillError, fill);
              }
              break;
            }
            case 'resetAll': {
              console.log('🔄 Processing reset all from another user');
              clearAll();
              break;
            }
            default:
              console.log('🤷 Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Error processing broadcast message:', error, message);
        }
      };

      multiplayer.room.onMessage('broadcast', handleBroadcast);
      
      return () => {
        try {
          multiplayer.room?.onMessage('broadcast', () => {});
        } catch (error) {
          console.error('❌ Error cleaning up broadcast listener:', error);
        }
      };
    }
  }, [multiplayer.room, setDrawingMarks, setSensationMarks, setBodyPartColors, clearAll]);

  const captureScreenshot = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#f8f9fa',
        useCORS: true,
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `emotional-body-map-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Top Banner - exactly matching original HTML structure */}
      <div id="topBanner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h2>Body Mapping Game</h2>
          {roomId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', marginTop: '4px' }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px' }}>
                {multiplayer.isConnected ? 'Connected' : multiplayer.isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
              <div style={{
                width: '8px', 
                height: '8px', 
                borderRadius: '50%',
                backgroundColor: multiplayer.isConnected ? '#4ade80' : multiplayer.isConnecting ? '#fbbf24' : '#ef4444'
              }} />
            </div>
          )}
        </div>
        <p>
          {roomId 
            ? 'Collaborate with others to identify, express, and understand emotions and how they show up in your bodies.'
            : 'This game helps us identify, express, and understand our emotions and how those emotions show up in our bodies.'
          }
        </p>
      </div>

      <div className="game-container">
        {/* Canvas Area - exactly matching original structure */}
        <div className="canvas-container">
          <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
            <BodyMapperCanvas
              mode={mode}
              selectedColor={selectedColor}
              brushSize={brushSize[0]}
              selectedSensation={selectedSensation}
              drawingMarks={drawingMarks}
              sensationMarks={sensationMarks}
              effects={effects}
              bodyPartColors={bodyPartColors}
              rotation={rotation}
              modelRef={modelRef}
              onAddDrawingMark={handleAddDrawingMark}
              onDrawingStrokeStart={handleDrawingStrokeStart}
              onDrawingStrokeComplete={handleDrawingStrokeComplete}
              onAddToDrawingStroke={handleAddToDrawingStroke}
              onBodyPartClick={handleBodyPartClick}
              onSensationClick={handleSensationClick}
              onRotateLeft={rotateLeft}
              onRotateRight={rotateRight}
            />
          </div>
          
          {/* Reset Button Container - exactly matching original */}
          <div className="reset-button-container">
            <button 
              onClick={handleResetAll} 
              className="main-reset-button"
              aria-label="Reset all changes to the body model" 
              title="Click to reset all changes"
            >
              Reset All Changes
            </button>
          </div>

          {/* Undo/Redo Container - exactly matching original */}
          <div className="undo-redo-container">
            <button className="control-button">↩ Undo</button>
            <button className="control-button">↪ Redo</button>
            <button onClick={captureScreenshot} className="control-button">
              📷 Snapshot
            </button>
          </div>
        </div>

        {/* Controls Area - exactly matching original structure */}
        <div className="controls-container">
          {/* Right Column with Tabbed Interface - exactly matching original */}
          <div id="rightColumn">
            <BodyMapperControls
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
    </div>
  );
};

export default EmotionalBodyMapper;
