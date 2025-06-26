
import React from 'react';
import { Brush, Palette, Sparkles, Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { emotionalColors, bodySensations } from '@/constants/bodyMapperConstants';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface BodyMapperControlsProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number[]) => void;
  onSensationChange: (sensation: SelectedSensation) => void;
}

const iconComponents = {
  Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
};

export const BodyMapperControls = ({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  onModeChange,
  onColorChange,
  onBrushSizeChange,
  onSensationChange
}: BodyMapperControlsProps) => {
  return (
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
                onClick={() => onModeChange('draw')}
              >
                <Brush className="w-4 h-4 mr-2" />
                Draw Mode
              </Button>
              <Button
                variant={mode === 'fill' ? 'default' : 'outline'}
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={() => onModeChange('fill')}
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
                    onClick={() => onColorChange(item.color)}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBrushSizeChange([Math.max(3, brushSize[0] - 2)])}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBrushSizeChange([Math.min(30, brushSize[0] + 2)])}
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
              onClick={() => onModeChange('sensations')}
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
  );
};
