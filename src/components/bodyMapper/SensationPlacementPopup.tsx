import React from 'react';
import { SelectedSensation } from '@/types/bodyMapperTypes';

// Import particle effect images
import butterflyImg from '@/Assets/particleEffects/butterfly.png';
import painImg from '@/Assets/particleEffects/pain.png';
import swirlImg from '@/Assets/particleEffects/swirl.png';
import waterImg from '@/Assets/particleEffects/water.png';
import snowflakesImg from '@/Assets/particleEffects/snowflakes.png';
import fireImg from '@/Assets/particleEffects/fire.png';
import heartImg from '@/Assets/particleEffects/heart.png';
import zzzImg from '@/Assets/particleEffects/zzz.png';
import windImg from '@/Assets/particleEffects/wind.png';
import lightningBoltImg from '@/Assets/particleEffects/lightning-bolt.png';
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

interface SensationPlacementPopupProps {
  selectedSensation: SelectedSensation | null;
  isVisible: boolean;
}

export const SensationPlacementPopup = ({ selectedSensation, isVisible }: SensationPlacementPopupProps) => {
  if (!isVisible || !selectedSensation) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[hsl(var(--deep-navy))]/80 text-white px-6 py-3 rounded-lg shadow-lg border border-[hsl(var(--deep-navy))]/30 animate-fade-in">
      <div className="flex items-center space-x-3">
        <img 
          src={getSensationImage(selectedSensation.name)} 
          alt={selectedSensation.name}
          className="w-6 h-6 object-contain"
        />
        <div>
          <p className="font-medium">
            {selectedSensation.name} selected
          </p>
          <p className="text-sm opacity-90">
            Click on the body model to place this sensation effect
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get sensation images
const getSensationImage = (sensationName: string) => {
  const imageMapping: { [key: string]: string } = {
    'Nerves': butterflyImg,
    'Pain': lightningBoltImg,
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