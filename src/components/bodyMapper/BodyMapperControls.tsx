import React, { useState, useEffect } from 'react';
import { Brush, Palette, Sparkles, Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EmotionRow } from './EmotionRow';
import { bodySensations } from '@/constants/bodyMapperConstants';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface BodyMapperControlsProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number[]) => void;
  onSensationChange: (sensation: SelectedSensation) => void;
  onEmotionsUpdate?: (emotions: CustomEmotion[]) => void;
}

const iconComponents = {
  Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
};

const defaultEmotions: CustomEmotion[] = [
  { color: '#ffeb3b', name: 'Joy' },
  { color: '#2196f3', name: 'Sadness' },
  { color: '#f44336', name: 'Anger' },
  { color: '#4caf50', name: '' },
  { color: '#9c27b0', name: '' },
  { color: '#ff9800', name: '' },
  { color: '#e91e63', name: '' },
  { color: '#00bcd4', name: '' },
  { color: '#8bc34a', name: '' }
];

export const BodyMapperControls = ({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  onModeChange,
  onColorChange,
  onBrushSizeChange,
  onSensationChange,
  onEmotionsUpdate
}: BodyMapperControlsProps) => {
  const [activeTab, setActiveTab] = useState('feelings');
  const [emotions, setEmotions] = useState<CustomEmotion[]>(defaultEmotions);

  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleEmotionColorChange = (index: number, color: string) => {
    const newEmotions = [...emotions];
    newEmotions[index] = { ...newEmotions[index], color };
    setEmotions(newEmotions);
    onEmotionsUpdate?.(newEmotions);
  };

  const handleEmotionNameChange = (index: number, name: string) => {
    const newEmotions = [...emotions];
    newEmotions[index] = { ...newEmotions[index], name };
    setEmotions(newEmotions);
    onEmotionsUpdate?.(newEmotions);
  };

  const handleEmotionSelect = (color: string) => {
    onColorChange(color);
  };

  useEffect(() => {
    onEmotionsUpdate?.(emotions);
  }, []);

  return (
    <div className="tab-container h-full flex flex-col">
      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'feelings' ? 'active' : ''}`}
          onClick={() => openTab('feelings')}
        >
          Color by Feelings
        </button>
        <button 
          className={`tab-button ${activeTab === 'sensations' ? 'active' : ''}`}
          onClick={() => openTab('sensations')}
        >
          Body Sensations and Signals
        </button>
      </div>

      {/* Color by Feelings Tab Content */}
      <div className={`tab-content ${activeTab === 'feelings' ? 'active' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Colors & Emotions</h3>
        <div className="subtext-box">
          <p>Identify the feelings you are experiencing, then choose a color that best represents each feeling for you. Use those colors to fill in the body outline.</p>
          <p><strong>Tip:</strong> You can use the colors to show where you feel each emotion or how big or strong that feeling is for you.</p>
        </div>

        {/* Painting Mode */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Painting Mode</h4>
          <div className="flex space-x-2">
            <button
              className={`game-button-primary ${mode === 'draw' ? 'opacity-100' : 'opacity-70'}`}
              onClick={() => onModeChange('draw')}
            >
              <Brush className="w-4 h-4 mr-2" />
              Draw Mode
            </button>
            <button
              className={`game-button-primary ${mode === 'fill' ? 'opacity-100' : 'opacity-70'}`}
              onClick={() => onModeChange('fill')}
            >
              <Palette className="w-4 h-4 mr-2" />
              Fill Mode
            </button>
          </div>
        </div>

        {/* Custom Emotions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Colors & Emotions</h4>
          <div className="space-y-4">
            {emotions.map((emotion, index) => (
              <EmotionRow
                key={index}
                color={emotion.color}
                emotion={emotion.name}
                placeholder={index < 3 ? ['Joy', 'Sadness', 'Anger'][index] : 'Enter emotion'}
                onColorChange={(color) => handleEmotionColorChange(index, color)}
                onEmotionChange={(name) => handleEmotionNameChange(index, name)}
                isSelected={selectedColor === emotion.color}
                onSelect={() => handleEmotionSelect(emotion.color)}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Brush Size</h4>
          <div className="space-y-3">
            <Slider
              value={brushSize}
              onValueChange={onBrushSizeChange}
              max={30}
              min={3}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Size: {brushSize[0]}px</span>
              <div className="flex space-x-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => onBrushSizeChange([Math.max(3, brushSize[0] - 2)])}
                >
                  -
                </button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => onBrushSizeChange([Math.min(30, brushSize[0] + 2)])}
                >
                  +
                </button>
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

      {/* Body Sensations and Signals Tab Content */}
      <div className={`tab-content ${activeTab === 'sensations' ? 'active' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Body Sensations and Signals</h3>
        <div className="subtext-box">
          <p>Sometimes our bodies give us clues about how we're feeling - like a tight chest when we're worried or butterflies in our tummy when we're nervous. Select a sensation below, then click on the body to place it.</p>
          <p><strong>Tip:</strong> Think about the signals your body gives you. Where do you feel tension, energy, or change when a big feeling shows up?</p>
        </div>

        {/* Sensation Mode Button */}
        <div className="mb-6">
          <button
            className={`game-button-primary w-full ${mode === 'sensations' ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => onModeChange('sensations')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Sensation Mode
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bodySensations.map((sensation, index) => {
            const isSelected = selectedSensation?.name === sensation.name;
            
            return (
              <button
                key={index}
                className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                  isSelected 
                    ? 'border-green-500 bg-green-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => {
                  onSensationChange({
                    icon: sensation.icon,
                    color: sensation.color,
                    name: sensation.name
                  });
                  onModeChange('sensations');
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
                        className={`w-6 h-6 mb-2 ${isSelected ? 'text-green-600' : ''}`} 
                        style={{ color: isSelected ? '#16a34a' : sensation.color }} 
                      />
                    ) : null;
                  })()
                )}
                <span className={`text-xs text-center ${isSelected ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                  {sensation.name}
                </span>
              </button>
            );
          })}
        </div>

        {selectedSensation && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected:</strong> {selectedSensation.name}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Click on the body model to place this sensation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
