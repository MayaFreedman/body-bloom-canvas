
import React from 'react';
import { Sparkles, Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star } from 'lucide-react';
import { bodySensations } from '@/constants/bodyMapperConstants';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface SensationSelectorProps {
  mode: BodyMapperMode;
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onSensationChange: (sensation: SelectedSensation) => void;
}

const iconComponents = {
  Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
};

export const SensationSelector = ({ mode, selectedSensation, onModeChange, onSensationChange }: SensationSelectorProps) => {
  return (
    <div>
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
  );
};
