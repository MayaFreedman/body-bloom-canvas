import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Brush, Palette, Sparkles, RotateCcw, Download, Zap, Droplet, Heart, Thermometer, Star, Wind, Activity, Snowflake, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HumanModel } from './HumanModel';
import { EffectsRenderer } from './EffectsRenderer';
import { ModelDrawing } from './ModelDrawing';
import SensationParticles from './SensationParticles';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import html2canvas from 'html2canvas';
import * as THREE from 'three';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
  color: string;
  size: number;
}

interface SensationMark {
  id: string;
  position: THREE.Vector3;
  icon: string;
  color: string;
  size: number;
}

interface Effect {
  id: string;
  type: 'sparkle' | 'pulse' | 'flow';
  x: number;
  y: number;
  color: string;
  intensity: number;
}

interface BodyPartColors {
  [key: string]: string;
}

interface EmotionalBodyMapperProps {
  roomId: string | null;
}

// Raycaster component to handle clicks on 3D model for fill mode and sensations
const ClickHandler = ({ mode, selectedColor, selectedSensation, onBodyPartClick, onSensationClick }: {
  mode: 'draw' | 'fill' | 'sensations';
  selectedColor: string;
  selectedSensation?: { icon: string; color: string; name: string };
  onBodyPartClick: (partName: string, color: string) => void;
  onSensationClick: (position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => void;
}) => {
  const { camera, gl, raycaster, mouse, scene } = useThree();

  const getBodyMeshes = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.bodyPart) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [scene]);

  const handleClick = useCallback((event: MouseEvent) => {
    if (mode === 'draw') return; // Drawing is handled by ModelDrawing component
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Get all body meshes
    const bodyMeshes = getBodyMeshes();
    const intersects = raycaster.intersectObjects(bodyMeshes, false);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const intersect = intersects[0];
      
      if (intersectedObject.userData.bodyPart) {
        if (mode === 'fill') {
          console.log(`Filling body part: ${intersectedObject.userData.bodyPart} with color: ${selectedColor}`);
          onBodyPartClick(intersectedObject.userData.bodyPart, selectedColor);
          return;
        }
        
        if (mode === 'sensations' && selectedSensation) {
          // Convert world position to local position relative to the model
          const modelGroup = scene.children.find(child => child.type === 'Group');
          if (modelGroup) {
            const localPosition = new THREE.Vector3();
            modelGroup.worldToLocal(localPosition.copy(intersect.point));
            onSensationClick(localPosition, selectedSensation);
          }
        }
      }
    }
  }, [mode, selectedColor, selectedSensation, onBodyPartClick, onSensationClick, camera, gl, raycaster, mouse, getBodyMeshes, scene]);

  React.useEffect(() => {
    if (mode !== 'draw') {
      gl.domElement.addEventListener('click', handleClick);
      return () => gl.domElement.removeEventListener('click', handleClick);
    }
  }, [handleClick, gl, mode]);

  return null;
};

const EmotionalBodyMapper = ({ roomId }: EmotionalBodyMapperProps) => {
  const [mode, setMode] = useState<'draw' | 'fill' | 'sensations'>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([10]); // Reduced default size
  const [selectedSensation, setSelectedSensation] = useState<{ icon: string; color: string; name: string } | null>(null);
  const [drawingMarks, setDrawingMarks] = useState<DrawingMark[]>([]);
  const [sensationMarks, setSensationMarks] = useState<SensationMark[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [bodyPartColors, setBodyPartColors] = useState<BodyPartColors>({});
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);

  // Initialize multiplayer
  const multiplayer = useMultiplayer(roomId);

  const emotionalColors = [
    { color: '#FFD700', name: 'Joy', emotion: 'joy' },
    { color: '#4169E1', name: 'Sadness', emotion: 'sadness' },
    { color: '#FF0000', name: 'Anger', emotion: 'anger' },
    { color: '#32CD32', name: 'Disgust', emotion: 'disgust' },
    { color: '#800080', name: 'Fear', emotion: 'fear' },
    { color: '#FFA500', name: 'Surprise', emotion: 'surprise' },
    { color: '#FF69B4', name: 'Love', emotion: 'love' },
    { color: '#87CEEB', name: 'Peace', emotion: 'peace' },
    { color: '#98FB98', name: 'Hope', emotion: 'hope' },
    { color: '#DDA0DD', name: 'Anxiety', emotion: 'anxiety' },
    { color: '#F0E68C', name: 'Excitement', emotion: 'excitement' },
    { color: '#CD853F', name: 'Shame', emotion: 'shame' }
  ];

  const bodySensations = [
    { icon: 'butterfly', name: 'Nerves', color: '#9966CC' },
    { icon: 'Zap', name: 'Pain', color: '#FFD700' },
    { icon: 'Wind', name: 'Nausea', color: '#32CD32' },
    { icon: 'Droplet', name: 'Tears', color: '#4169E1' },
    { icon: 'Snowflake', name: 'Decreased Temperature', color: '#87CEEB' },
    { icon: 'Thermometer', name: 'Increased Temperature', color: '#FF4500' },
    { icon: 'Heart', name: 'Increased Heart Rate', color: '#FF1493' },
    { icon: 'Heart', name: 'Decreased Heart Rate', color: '#800080' },
    { icon: 'Wind', name: 'Tired', color: '#696969' },
    { icon: 'Activity', name: 'Change in Breathing', color: '#20B2AA' },
    { icon: 'Star', name: 'Tingling', color: '#FFD700' },
    { icon: 'Activity', name: 'Shaky', color: '#FF6347' },
    { icon: 'Droplet', name: 'Pacing', color: '#4682B4' },
    { icon: 'Activity', name: 'Stomping', color: '#8B4513' },
    { icon: 'Wind', name: 'Tight', color: '#2F4F4F' },
    { icon: 'Sparkles', name: 'Lump in Throat', color: '#9ACD32' },
    { icon: 'Activity', name: 'Change in Appetite', color: '#FF8C00' },
    { icon: 'Wind', name: 'Heaviness', color: '#708090' },
    { icon: 'Activity', name: 'Fidgety', color: '#DC143C' },
    { icon: 'Snowflake', name: 'Frozen/Stiff', color: '#B0C4DE' }
  ];

  const iconComponents = {
    Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
  };

  const handleAddDrawingMark = useCallback((mark: DrawingMark) => {
    setDrawingMarks(prev => [...prev, mark]);
  }, []);

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

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));
    
    // Broadcast to multiplayer
    if (multiplayer.isConnected) {
      multiplayer.broadcastBodyPartFill({ partName, color });
    }
  }, [multiplayer]);

  const handleSensationClick = useCallback((position: THREE.Vector3, sensation: { icon: string; color: string; name: string }) => {
    const newSensationMark: SensationMark = {
      id: `sensation-${Date.now()}-${Math.random()}`,
      position,
      icon: sensation.icon,
      color: sensation.color,
      size: 0.1
    };
    setSensationMarks(prev => [...prev, newSensationMark]);
    
    // Broadcast to multiplayer
    if (multiplayer.isConnected) {
      multiplayer.broadcastSensation({
        id: newSensationMark.id,
        position,
        icon: sensation.icon,
        color: sensation.color,
        size: 0.1
      });
    }
  }, [multiplayer]);

  // Handle multiplayer messages with error boundaries
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
                    
                    const mark: DrawingMark = {
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
  }, [multiplayer.room]);

  const rotateLeft = () => {
    setRotation(prev => prev - Math.PI / 2);
  };

  const rotateRight = () => {
    setRotation(prev => prev + Math.PI / 2);
  };

  const clearAll = () => {
    setDrawingMarks([]);
    setEffects([]);
    setBodyPartColors({});
    setSensationMarks([]);
  };

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
            <div 
              ref={canvasRef}
              className="bg-white rounded-lg shadow-lg overflow-hidden relative"
              style={{ height: '600px' }}
            >
              {/* Left Rotation Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                onClick={rotateLeft}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              {/* Right Rotation Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                onClick={rotateRight}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />
                
                <group ref={modelRef} rotation={[0, rotation, 0]}>
                  <HumanModel bodyPartColors={bodyPartColors} />
                  
                  {/* Render drawing marks as children of the model group so they rotate with it */}
                  {drawingMarks.map((mark) => (
                    <mesh key={mark.id} position={mark.position}>
                      <sphereGeometry args={[mark.size, 8, 8]} />
                      <meshBasicMaterial color={mark.color} />      
                    </mesh>
                  ))}

                  {/* Render sensation particles as children of the model group */}
                  <SensationParticles sensationMarks={sensationMarks} />
                </group>
                
                <ModelDrawing
                  isDrawing={mode === 'draw'}
                  drawingMarks={drawingMarks}
                  selectedColor={selectedColor}
                  brushSize={brushSize[0]}
                  onAddMark={handleAddDrawingMark}
                  onStrokeStart={handleDrawingStrokeStart}
                  onStrokeComplete={handleDrawingStrokeComplete}
                  onAddToStroke={handleAddToDrawingStroke}
                  modelRef={modelRef}
                />
                
                <EffectsRenderer effects={effects} />
                
                <ClickHandler 
                  mode={mode}
                  selectedColor={selectedColor}
                  selectedSensation={selectedSensation}
                  onBodyPartClick={handleBodyPartClick}
                  onSensationClick={handleSensationClick}
                />
                
                <OrbitControls 
                  enableRotate={false}
                  enablePan={false}
                  minDistance={3}
                  maxDistance={8}
                  maxPolarAngle={Math.PI}
                  minPolarAngle={0}
                  enabled={mode !== 'draw'}
                />
              </Canvas>
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
            <Tabs defaultValue="feelings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feelings" className="bg-green-500 text-white data-[state=active]:bg-green-600">
                  Color by Feelings
                </TabsTrigger>
                <TabsTrigger value="sensations" className="bg-green-500 text-white data-[state=active]:bg-green-600">
                  Body Sensations and Signals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feelings" className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Color by Feelings</h3>
                  <p className="text-gray-600 mb-4">
                    Identify the feelings you are experiencing, then choose a color that best represents each feeling for 
                    you. Use those colors to fill in the body outline.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    <strong>Tip:</strong> You can use the colors to show where you feel each emotion or how big or strong that feeling is for you.
                  </p>

                  {/* Painting Mode */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Painting Mode</h4>
                    <div className="flex space-x-2">
                      <Button
                        variant={mode === 'draw' ? 'default' : 'outline'}
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => setMode('draw')}
                      >
                        <Brush className="w-4 h-4 mr-2" />
                        Draw Mode
                      </Button>
                      <Button
                        variant={mode === 'fill' ? 'default' : 'outline'}
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => setMode('fill')}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Fill Mode
                      </Button>
                    </div>
                  </div>

                  {/* Colors & Emotions */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Colors & Emotions</h4>
                    <div className="space-y-2">
                      {emotionalColors.map((item) => (
                        <div key={item.color} className="flex items-center space-x-3">
                          <button
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-105 ${
                              selectedColor === item.color ? 'border-gray-800 shadow-lg' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: item.color }}
                            onClick={() => setSelectedColor(item.color)}
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brush Size - Enhanced */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Brush Size</h4>
                    <div className="space-y-3">
                      <Slider
                        value={brushSize}
                        onValueChange={setBrushSize}
                        max={30}
                        min={3}
                        step={1}
                        className="mb-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Size: {brushSize[0]}px</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBrushSize([Math.max(3, brushSize[0] - 2)])}
                          >
                            -
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBrushSize([Math.min(30, brushSize[0] + 2)])}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      {/* Visual size indicator */}
                      <div className="flex justify-center">
                        <div 
                          className="rounded-full border-2 border-gray-300"
                          style={{ 
                            width: `${brushSize[0]}px`, 
                            height: `${brushSize[0]}px`,
                            backgroundColor: selectedColor + '50'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sensations" className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Body Sensations and Signals</h3>
                  <p className="text-gray-600 mb-4">
                    Sometimes our bodies give us clues about how we're feeling - like a tight chest when we're worried or 
                    butterflies in our tummy when we're nervous. Select a sensation below, then click on the body to place it.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    <strong>Tip:</strong> Think about the signals your body gives you. Where do you feel tension, energy, or change when 
                    a big feeling shows up?
                  </p>

                  {/* Sensation Mode Button */}
                  <div className="mb-6">
                    <Button
                      variant={mode === 'sensations' ? 'default' : 'outline'}
                      className="w-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => setMode('sensations')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Sensation Mode
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {bodySensations.map((sensation, index) => {
                      const isSelected = selectedSensation?.name === sensation.name;
                      
                      return (
                        <button
                          key={index}
                          className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedSensation({
                              icon: sensation.icon,
                              color: sensation.color,
                              name: sensation.name
                            });
                            setMode('sensations');
                          }}
                        >
                          {sensation.icon === 'butterfly' ? (
                            <img 
                              src="/lovable-uploads/b0a2add0-f14a-40a7-add9-b5efdb14a891.png" 
                              alt="Butterfly"
                              className={`w-6 h-6 mb-2 ${isSelected ? 'opacity-100' : 'opacity-80'}`}
                            />
                          ) : (
                            (() => {
                              const IconComponent = iconComponents[sensation.icon as keyof typeof iconComponents];
                              return IconComponent ? (
                                <IconComponent 
                                  className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : ''}`} 
                                  style={{ color: isSelected ? '#2563eb' : sensation.color }} 
                                />
                              ) : null;
                            })()
                          )}
                          <span className={`text-xs text-center ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                            {sensation.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSensation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {selectedSensation.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Click on the body model to place this sensation
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalBodyMapper;
