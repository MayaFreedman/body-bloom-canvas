
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Brush, Palette, Sparkles, RotateCcw, Download, Zap, Droplet, Heart, Thermometer, Star, Wind, Activity, Snowflake, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HumanModel } from './HumanModel';
import { EffectsRenderer } from './EffectsRenderer';
import { ModelDrawing } from './ModelDrawing';
import html2canvas from 'html2canvas';
import * as THREE from 'three';

interface DrawingMark {
  id: string;
  position: THREE.Vector3;
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

// Raycaster component to handle clicks on 3D model for fill mode and effects
const ClickHandler = ({ mode, selectedColor, onBodyPartClick, onScreenClick }: {
  mode: 'draw' | 'fill' | 'effects';
  selectedColor: string;
  onBodyPartClick: (partName: string, color: string) => void;
  onScreenClick: (x: number, y: number) => void;
}) => {
  const { camera, gl, raycaster, mouse, scene } = useThree();

  const handleClick = useCallback((event: MouseEvent) => {
    if (mode === 'draw') return; // Drawing is handled by ModelDrawing component
    
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject.userData.bodyPart && mode === 'fill') {
        onBodyPartClick(intersectedObject.userData.bodyPart, selectedColor);
        return;
      }
    }

    if (mode === 'effects') {
      onScreenClick(event.clientX - rect.left, event.clientY - rect.top);
    }
  }, [mode, selectedColor, onBodyPartClick, onScreenClick, camera, gl, raycaster, mouse, scene]);

  React.useEffect(() => {
    if (mode !== 'draw') {
      gl.domElement.addEventListener('click', handleClick);
      return () => gl.domElement.removeEventListener('click', handleClick);
    }
  }, [handleClick, gl, mode]);

  return null;
};

const EmotionalBodyMapper = () => {
  const [mode, setMode] = useState<'draw' | 'fill' | 'effects'>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([10]); // Reduced default size
  const [selectedEffect, setSelectedEffect] = useState<'sparkle' | 'pulse' | 'flow'>('sparkle');
  const [drawingMarks, setDrawingMarks] = useState<DrawingMark[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [bodyPartColors, setBodyPartColors] = useState<BodyPartColors>({});
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group>(null);

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
    { icon: Activity, name: 'Nerves', color: '#9966CC' },
    { icon: Zap, name: 'Pain', color: '#FFD700' },
    { icon: Wind, name: 'Nausea', color: '#32CD32' },
    { icon: Droplet, name: 'Tears', color: '#4169E1' },
    { icon: Snowflake, name: 'Decreased Temperature', color: '#87CEEB' },
    { icon: Thermometer, name: 'Increased Temperature', color: '#FF4500' },
    { icon: Heart, name: 'Increased Heart Rate', color: '#FF1493' },
    { icon: Heart, name: 'Decreased Heart Rate', color: '#800080' },
    { icon: Wind, name: 'Tired', color: '#696969' },
    { icon: Activity, name: 'Change in Breathing', color: '#20B2AA' },
    { icon: Star, name: 'Tingling', color: '#FFD700' },
    { icon: Activity, name: 'Shaky', color: '#FF6347' },
    { icon: Droplet, name: 'Pacing', color: '#4682B4' },
    { icon: Activity, name: 'Stomping', color: '#8B4513' },
    { icon: Wind, name: 'Tight', color: '#2F4F4F' },
    { icon: Sparkles, name: 'Lump in Throat', color: '#9ACD32' },
    { icon: Activity, name: 'Change in Appetite', color: '#FF8C00' },
    { icon: Wind, name: 'Heaviness', color: '#708090' },
    { icon: Activity, name: 'Fidgety', color: '#DC143C' },
    { icon: Snowflake, name: 'Frozen/Stiff', color: '#B0C4DE' }
  ];

  const handleAddDrawingMark = useCallback((mark: DrawingMark) => {
    setDrawingMarks(prev => [...prev, mark]);
  }, []);

  const handleBodyPartClick = useCallback((partName: string, color: string) => {
    setBodyPartColors(prev => ({
      ...prev,
      [partName]: color
    }));
  }, []);

  const handleScreenClick = useCallback((x: number, y: number) => {
    if (mode === 'effects') {
      const newEffect: Effect = {
        id: `effect-${Date.now()}`,
        type: selectedEffect,
        x,
        y,
        color: selectedColor,
        intensity: brushSize[0] / 20
      };
      setEffects(prev => [...prev, newEffect]);
    }
  }, [mode, selectedEffect, selectedColor, brushSize]);

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Body Mapping Game</h1>
          <p className="text-lg text-gray-600">This game helps us identify, express, and understand our emotions and how those emotions show up in our bodies.</p>
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
                </group>
                
                <ModelDrawing
                  isDrawing={mode === 'draw'}
                  drawingMarks={drawingMarks}
                  selectedColor={selectedColor}
                  brushSize={brushSize[0]}
                  onAddMark={handleAddDrawingMark}
                  modelRef={modelRef}
                />
                
                <EffectsRenderer effects={effects} />
                
                <ClickHandler 
                  mode={mode}
                  selectedColor={selectedColor}
                  onBodyPartClick={handleBodyPartClick}
                  onScreenClick={handleScreenClick}
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
                  : 'Use rotation buttons to rotate • Scroll to zoom • Click to add effects'
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
                    butterflies in our tummy when we're nervous. Use these stamps to show what you notice in your body 
                    when you're feeling something.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    <strong>Tip:</strong> Think about the signals your body gives you. Where do you feel tension, energy, or change when 
                    a big feeling shows up?
                  </p>

                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search for effects..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {bodySensations.map((sensation, index) => {
                      const IconComponent = sensation.icon;
                      return (
                        <button
                          key={index}
                          className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedColor(sensation.color);
                            setMode('effects');
                          }}
                        >
                          <IconComponent className="w-6 h-6 mb-2" style={{ color: sensation.color }} />
                          <span className="text-xs text-gray-600 text-center">{sensation.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Effect Controls */}
                  {mode === 'effects' && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Effect Type</h4>
                      <div className="space-y-2">
                        <Button
                          variant={selectedEffect === 'sparkle' ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setSelectedEffect('sparkle')}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Sparkles
                        </Button>
                        <Button
                          variant={selectedEffect === 'pulse' ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setSelectedEffect('pulse')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Pulse
                        </Button>
                        <Button
                          variant={selectedEffect === 'flow' ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setSelectedEffect('flow')}
                        >
                          <Droplet className="w-4 h-4 mr-2" />
                          Flow
                        </Button>
                      </div>
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
