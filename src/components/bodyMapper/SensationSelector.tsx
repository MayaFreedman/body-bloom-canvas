
import React from 'react';
import { Sparkles, Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star } from 'lucide-react';
import { bodySensations } from '@/constants/bodyMapperConstants';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

// Import particle effect images for previews
import butterflyImg from '@/Assets/particleEffects/butterfly.png';
import painImg from '@/Assets/particleEffects/pain.png';
import swirlImg from '@/Assets/particleEffects/swirl.png';
import waterImg from '@/Assets/particleEffects/water.png';
import snowflakesImg from '@/Assets/particleEffects/snowflakes.png';
import fireImg from '@/Assets/particleEffects/fire.png';
import heartImg from '@/Assets/particleEffects/heart.png';
import zzzImg from '@/Assets/particleEffects/zzz.png';
import windImg from '@/Assets/particleEffects/wind.png';
import starImg from '@/Assets/particleEffects/star.png';
import shakeImg from '@/Assets/particleEffects/shake.png';
import feetImg from '@/Assets/particleEffects/feet.png';
import feetredImg from '@/Assets/particleEffects/feetred.png';
import nauticalKnotImg from '@/Assets/particleEffects/nautical-knot.png';
import frogImg from '@/Assets/particleEffects/frog.png';
import plateImg from '@/Assets/particleEffects/plate.png';
import stoneImg from '@/Assets/particleEffects/stone.png';
import fidgetSpinnerImg from '@/Assets/particleEffects/fidget-spinner.png';
import statueImg from '@/Assets/particleEffects/statue.png';
import snailImg from '@/Assets/particleEffects/snail.png';
import desertImg from '@/Assets/particleEffects/desert.png';
import clenchedFistImg from '@/Assets/particleEffects/clenched-fist.png';
import lightbulbImg from '@/Assets/particleEffects/lightbulb.png';
import monkeyImg from '@/Assets/particleEffects/monkey.png';
import wavyImg from '@/Assets/particleEffects/wavy.png';
import goosebumpImg from '@/Assets/particleEffects/goosebump.png';
import relaxImg from '@/Assets/particleEffects/relax.png';
import sweatImg from '@/Assets/particleEffects/sweat.png';

interface SensationSelectorProps {
  mode: BodyMapperMode;
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onSensationChange: (sensation: SelectedSensation) => void;
}

const iconComponents = {
  Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
};

// Map sensation names to their corresponding images
const getSensationImage = (sensationName: string) => {
  const imageMapping: { [key: string]: string } = {
    'Nerves': butterflyImg,
    'Pain': painImg,
    'Nausea': swirlImg,
    'Tears': waterImg,
    'Decreased Temperature': snowflakesImg,
    'Increased Temperature': fireImg,
    'Increased Heart Rate': heartImg,
    'Decreased Heart Rate': heartImg,
    'Tired': zzzImg,
    'Change in Breathing': windImg,
    'Tingling': starImg,
    'Shaky': shakeImg,
    'Pacing': feetImg,
    'Stomping': feetredImg,
    'Tight': nauticalKnotImg,
    'Lump in Throat': frogImg,
    'Change in Appetite': plateImg,
    'Heaviness': stoneImg,
    'Fidgety': fidgetSpinnerImg,
    'Frozen/Stiff': statueImg,
    'Ache': painImg,
    'Feeling Small': snailImg,
    'Dry Mouth': desertImg,
    'Clenched': clenchedFistImg,
    'Change in Energy': lightbulbImg,
    'Avoiding Eye Contact': monkeyImg,
    'Scrunched Face': wavyImg,
    'Goosebumps': goosebumpImg,
    'Relaxed': relaxImg,
    'Sweat': sweatImg
  };
  
  return imageMapping[sensationName] || starImg;
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
              <img 
                src={getSensationImage(sensation.name)} 
                alt={sensation.name}
                className={`w-6 h-6 mb-2 object-contain ${isSelected ? 'opacity-100' : 'opacity-80'}`}
              />
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
