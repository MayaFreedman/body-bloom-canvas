
import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Brush, Palette, Sparkles, RotateCcw, Download, Zap, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { HumanModel } from './HumanModel';
import { EffectsRenderer } from './EffectsRenderer';
import html2canvas from 'html2canvas';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  timestamp: number;
}

interface Effect {
  id: string;
  type: 'sparkle' | 'pulse' | 'flow';
  x: number;
  y: number;
  color: string;
  intensity: number;
}

const EmotionalBodyMapper = () => {
  const [mode, setMode] = useState<'draw' | 'effects'>('draw');
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState([15]);
  const [selectedEffect, setSelectedEffect] = useState<'sparkle' | 'pulse' | 'flow'>('sparkle');
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const emotionalColors = [
    { color: '#ff6b6b', name: 'Passion/Anger', emotion: 'anger' },
    { color: '#4ecdc4', name: 'Calm/Peace', emotion: 'calm' },
    { color: '#45b7d1', name: 'Sadness/Flow', emotion: 'sadness' },
    { color: '#96ceb4', name: 'Growth/Hope', emotion: 'hope' },
    { color: '#feca57', name: 'Joy/Energy', emotion: 'joy' },
    { color: '#ff9ff3', name: 'Love/Warmth', emotion: 'love' },
    { color: '#a8e6cf', name: 'Healing/Recovery', emotion: 'healing' },
    { color: '#dda0dd', name: 'Creativity/Spirit', emotion: 'creativity' }
  ];

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (mode === 'draw') {
      const newPoint: DrawingPoint = {
        x,
        y,
        color: selectedColor,
        size: brushSize[0],
        timestamp: Date.now()
      };
      setDrawingPoints(prev => [...prev, newPoint]);
    } else if (mode === 'effects') {
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
  }, [mode, selectedColor, brushSize, selectedEffect]);

  const clearAll = () => {
    setDrawingPoints([]);
    setEffects([]);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Emotional Body Mapper</h1>
          <p className="text-lg text-gray-600">Express your feelings by painting on the body where you experience emotions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mode Selection */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Mode</h3>
              <div className="space-y-2">
                <Button
                  variant={mode === 'draw' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setMode('draw')}
                >
                  <Brush className="w-4 h-4 mr-2" />
                  Draw & Paint
                </Button>
                <Button
                  variant={mode === 'effects' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setMode('effects')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Effects
                </Button>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Emotional Colors
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {emotionalColors.map((item) => (
                  <button
                    key={item.color}
                    className={`w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedColor === item.color ? 'border-gray-800 shadow-lg' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => setSelectedColor(item.color)}
                    title={item.name}
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600 text-center">
                {emotionalColors.find(c => c.color === selectedColor)?.name || 'Custom Color'}
              </div>
            </div>

            {/* Brush/Effect Settings */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                {mode === 'draw' ? 'Brush Size' : 'Effect Intensity'}
              </h3>
              <Slider
                value={brushSize}
                onValueChange={setBrushSize}
                max={50}
                min={5}
                step={1}
                className="mb-2"
              />
              <div className="text-sm text-gray-600 text-center">{brushSize[0]}px</div>
            </div>

            {/* Effect Type Selection */}
            {mode === 'effects' && (
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Effect Type</h3>
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

            {/* Actions */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={clearAll}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={captureScreenshot}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save Image
                </Button>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="lg:col-span-3">
            <div 
              ref={canvasRef}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-crosshair relative"
              style={{ height: '600px' }}
              onClick={handleCanvasClick}
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />
                
                <HumanModel />
                <EffectsRenderer effects={effects} />
                
                <OrbitControls 
                  enablePan={false}
                  minDistance={3}
                  maxDistance={8}
                  maxPolarAngle={Math.PI}
                  minPolarAngle={0}
                />
              </Canvas>
              
              {/* Drawing Layer */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {drawingPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={point.size / 2}
                      fill={point.color}
                      opacity={0.7}
                      className="animate-fade-in"
                    />
                  ))}
                </svg>
              </div>
            </div>
            
            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">Click and drag to rotate • Scroll to zoom • Click to {mode === 'draw' ? 'paint' : 'add effects'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalBodyMapper;
