
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
  }, [multiplayer.room, setDrawingMarks, setSensationMarks, setBodyPartColors]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">Body Mapping Game</h1>
            {roomId && (
              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {multiplayer.isConnected ? 'Connected' : multiplayer.isConnecting ? 'Connecting...' : 'Disconnected'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  multiplayer.isConnected ? 'bg-green-500' : 
                  multiplayer.isConnecting ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {roomId 
              ? 'Collaborate with others to identify, express, and understand emotions and how they show up in your bodies.'
              : 'This game helps us identify, express, and understand our emotions and how those emotions show up in our bodies.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Canvas */}
          <div className="lg:col-span-2 lg:order-1">
            <div ref={canvasRef}>
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
            
            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">
                {mode === 'draw' 
                  ? 'Click and drag on the body model to draw • Use rotation buttons to rotate'
                  : mode === 'fill'
                  ? 'Click on body parts to fill them with color • Use rotation buttons to rotate • Scroll to zoom'
                  : 'Click on body parts to place sensations • Use rotation buttons to rotate • Scroll to zoom'
                }
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <Button variant="outline" onClick={clearAll} className="bg-red-500 text-white hover:bg-red-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Changes
              </Button>
              <Button variant="outline" onClick={captureScreenshot}>
                <Download className="w-4 h-4 mr-2" />
                Snapshot
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 lg:order-2">
            <BodyMapperControls
              mode={mode}
              selectedColor={selectedColor}
              brushSize={brushSize}
              selectedSensation={selectedSensation}
              onModeChange={setMode}
              onColorChange={setSelectedColor}
              onBrushSizeChange={setBrushSize}
              onSensationChange={setSelectedSensation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalBodyMapper;
