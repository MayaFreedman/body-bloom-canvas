
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Sparkles, Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star } from 'lucide-react';
import { bodySensations } from '@/constants/bodyMapperConstants';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { CustomSensation, CustomEffectForm } from '@/types/customEffectTypes';
import { CustomEffectDialog } from './CustomEffectDialog';
import { createCustomSensation, generateCustomEffectImage, saveCustomEffects, loadCustomEffects } from '@/utils/customEffectGenerator';
import createIcon from '@/Assets/particleEffects/create.png';

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

// Import custom effect images
import flowerImg from '@/Assets/particleEffects/flower.png';
import tornadoImg from '@/Assets/particleEffects/tornado.png';
import chickenImg from '@/Assets/particleEffects/chicken.png';
import stormImg from '@/Assets/particleEffects/storm.png';
import explosionImg from '@/Assets/particleEffects/explosion.png';
import supportheartImg from '@/Assets/particleEffects/supportheart.png';
import baloonImg from '@/Assets/particleEffects/baloon.png';
import musicalNoteImg from '@/Assets/particleEffects/musical-note.png';
import catImg from '@/Assets/particleEffects/cat.png';
import dogImg from '@/Assets/particleEffects/dog.png';
import racecarImg from '@/Assets/particleEffects/racecar.png';
import rollerCoasterImg from '@/Assets/particleEffects/roller-coaster.png';
import brokenHeartImg from '@/Assets/particleEffects/broken-heart.png';
import robotImg from '@/Assets/particleEffects/robot.png';
import bicepsImg from '@/Assets/particleEffects/biceps.png';
import wingsImg from '@/Assets/particleEffects/wings.png';
import alarmImg from '@/Assets/particleEffects/alarm.png';
import spaceshipImg from '@/Assets/particleEffects/spaceship.png';
import shieldImg from '@/Assets/particleEffects/shield.png';

interface SensationSelectorProps {
  mode: BodyMapperMode;
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onSensationChange: (sensation: SelectedSensation | null) => void;
}

const iconComponents = {
  Activity, Zap, Wind, Droplet, Snowflake, Thermometer, Heart, Star, Sparkles
};

// Map sensation names to their corresponding images
export const getSensationImage = (sensationName: string, customIcon?: string) => {
  // If it's a custom effect with an icon, try to get the custom icon image first
  if (customIcon) {
    const customIconMapping: { [key: string]: string } = {
      'flower': flowerImg,
      'tornado': tornadoImg,
      'chicken': chickenImg,
      'storm': stormImg,
      'explosion': explosionImg,
      'supportheart': supportheartImg,
      'baloon': baloonImg,
      'musical-note': musicalNoteImg,
      'cat': catImg,
      'dog': dogImg,
      'racecar': racecarImg,
      'roller-coaster': rollerCoasterImg,
      'broken-heart': brokenHeartImg,
      'robot': robotImg,
      'biceps': bicepsImg,
      'wings': wingsImg,
      'alarm': alarmImg,
      'lightbulb': lightbulbImg,
      'spaceship': spaceshipImg,
      'shield': shieldImg
    };
    
    if (customIconMapping[customIcon]) {
      return customIconMapping[customIcon];
    }
  }

  // Fallback to built-in sensation mapping
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

interface SensationSelectorPropsWithMultiplayer extends SensationSelectorProps {
  onCustomEffectCreated?: (customEffect: any) => void;
}

export const SensationSelector = forwardRef<any, SensationSelectorPropsWithMultiplayer>(({ 
  mode, 
  selectedSensation, 
  onModeChange, 
  onSensationChange, 
  onCustomEffectCreated 
}, ref) => {
  const [customEffects, setCustomEffects] = useState<CustomSensation[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [customImages, setCustomImages] = useState<Map<string, string>>(new Map());

  // Load custom effects on mount
  useEffect(() => {
    const loadedEffects = loadCustomEffects();
    setCustomEffects(loadedEffects);
    
    // Generate images for loaded effects
    loadedEffects.forEach(async (effect) => {
      try {
        const imageUrl = await generateCustomEffectImage(effect.selectedIcon as any, effect.color);
        setCustomImages(prev => new Map(prev).set(effect.id, imageUrl));
      } catch (error) {
        console.warn('Failed to generate image for custom effect:', effect.name, error);
      }
    });
  }, []);

  // Handle creating new custom effect
  const handleCreateCustomEffect = async (form: CustomEffectForm) => {
    console.log('🎯 SensationSelector - handleCreateCustomEffect called with form:', form);
    
    try {
      const customSensation = createCustomSensation(form);
      console.log('🎯 SensationSelector - Created custom sensation:', customSensation);
      console.log('🎯 SensationSelector - Custom effect details:', {
        name: customSensation.name,
        selectedIcon: customSensation.selectedIcon,
        icon: customSensation.icon,
        color: customSensation.color,
        movementBehavior: customSensation.movementBehavior,
        isCustom: customSensation.isCustom
      });
      
      const imageUrl = await generateCustomEffectImage(customSensation.selectedIcon as any, customSensation.color);
      console.log('🎯 SensationSelector - Generated image URL:', imageUrl);
      
      const updatedEffects = [...customEffects, customSensation];
      setCustomEffects(updatedEffects);
      setCustomImages(prev => new Map(prev).set(customSensation.id, imageUrl));
      saveCustomEffects(updatedEffects);
      
      console.log('🎯 SensationSelector - Updated custom effects list:', updatedEffects);
      console.log('✨ Created custom effect:', customSensation);
      
      // Broadcast the custom effect creation to other players
      if (onCustomEffectCreated) {
        console.log('🔥 SensationSelector - Broadcasting custom effect creation:', customSensation);
        onCustomEffectCreated(customSensation);
      }
    } catch (error) {
      console.error('🎯 SensationSelector - Failed to create custom effect:', error);
    }
  };

  // Handle incoming custom effect from multiplayer
  const handleIncomingCustomEffect = async (customEffect: any) => {
    console.log('🎯 SensationSelector - Handling incoming custom effect:', customEffect);
    
    try {
      // Check if the effect already exists
      const existingEffect = customEffects.find(effect => effect.id === customEffect.id);
      if (existingEffect) {
        console.log('🎯 SensationSelector - Custom effect already exists:', existingEffect);
        return;
      }

      // Generate image for the custom effect
      const imageUrl = await generateCustomEffectImage(customEffect.selectedIcon as any, customEffect.color);
      
      // Add to local state
      const updatedEffects = [...customEffects, customEffect];
      setCustomEffects(updatedEffects);
      setCustomImages(prev => new Map(prev).set(customEffect.id, imageUrl));
      
      // Save to localStorage
      saveCustomEffects(updatedEffects);
      
      console.log('🎯 SensationSelector - Added incoming custom effect:', customEffect);
    } catch (error) {
      console.error('🎯 SensationSelector - Failed to handle incoming custom effect:', error);
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleIncomingCustomEffect
  }), [customEffects]);

  // Get image for sensation (including custom ones)
  const getSensationImageForDisplay = (sensation: SelectedSensation | CustomSensation) => {
    if ('isCustom' in sensation && sensation.isCustom) {
      return customImages.get(sensation.id) || getSensationImage(sensation.name);
    }
    return getSensationImage(sensation.name);
  };

  // Combine built-in and custom sensations
  const allSensations = [...bodySensations, ...customEffects];

  return (
    <div>
      <div className="mb-4">
        <p>Sometimes our bodies give us clues about how we're feeling - like a tight chest when we're worried or butterflies in our tummy when we're nervous. Select a sensation below, then click on the body to place it.</p>
        <p className="mt-3"><strong>Tip:</strong> Think about the signals your body gives you. Where do you feel tension, energy, or change when a big feeling shows up?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {allSensations.map((sensation, index) => {
          const isSelected = selectedSensation?.name === sensation.name;
          
          return (
            <button
              key={index}
              className={`flex flex-col items-center p-3 border rounded-lg transition-all outline-none focus:outline-none ${
                isSelected 
                  ? 'border-foreground bg-primary/10 shadow-md transform scale-105' 
                  : 'border-foreground/20 hover:bg-muted hover:border-foreground/40'
              }`}
              onClick={() => {
                console.log('🎯 SensationSelector - Sensation clicked:', sensation.name, 'isCurrentlySelected:', isSelected);
                
                if (isSelected) {
                  // Unequip if clicking the same sensation
                  console.log('🎯 SensationSelector - Unequipping sensation');
                  onSensationChange(null);
                } else {
                  // Equip the new sensation and reset to draw mode (neutral state)
                  console.log('🎯 SensationSelector - Equipping sensation:', sensation.name, 'and switching to draw mode');
                  onModeChange('draw'); // Switch to draw mode to unequip other tools
                  
                  // Handle custom vs built-in sensations
                  if ('isCustom' in sensation && sensation.isCustom) {
                    const customSensation = sensation as CustomSensation;
                    console.log('🎯 SensationSelector - Selecting custom sensation:', customSensation);
                    console.log('🎯 SensationSelector - Custom sensation icon:', customSensation.icon, 'selectedIcon:', customSensation.selectedIcon);
                    onSensationChange({
                      icon: customSensation.selectedIcon, // Use selectedIcon instead of icon for custom effects
                      color: customSensation.color,
                      name: customSensation.name,
                      movementBehavior: customSensation.movementBehavior,
                      isCustom: customSensation.isCustom
                    });
                  } else {
                    onSensationChange({
                      icon: sensation.icon,
                      color: sensation.color,
                      name: sensation.name
                    });
                  }
                }
              }}
            >
              <img 
                src={getSensationImageForDisplay(sensation)} 
                alt={sensation.name}
                className={`w-6 h-6 mb-2 object-contain ${isSelected ? 'opacity-100' : 'opacity-80'}`}
              />
              <span className={`text-xs text-center ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {sensation.name}
              </span>
            </button>
          );
        })}
        
        {/* Create Custom Effect Button */}
        <button
          className="flex flex-col items-center p-3 border border-dashed border-foreground/40 rounded-lg transition-all outline-none focus:outline-none hover:bg-muted hover:border-foreground/60"
          onClick={() => setShowCreateDialog(true)}
        >
          <img 
            src={createIcon} 
            alt="Create custom effect"
            className="w-6 h-6 mb-2 object-contain opacity-80"
          />
          <span className="text-xs text-center text-muted-foreground">
            Create Custom
          </span>
        </button>
      </div>

      {selectedSensation && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Selected:</strong> {selectedSensation.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click on the body model to place this sensation
          </p>
        </div>
      )}

      {/* Custom Effect Creation Dialog */}
      <CustomEffectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateEffect={handleCreateCustomEffect}
      />
    </div>
  );
});
