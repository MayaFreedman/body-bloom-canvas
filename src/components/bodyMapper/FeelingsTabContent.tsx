
import React from 'react';
import { PaintingModeSelector } from './PaintingModeSelector';
import { EmotionColorManager } from './EmotionColorManager';
import { BrushSizeControl } from './BrushSizeControl';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { TextControls } from './TextControls';
import { TextSettings } from '@/types/textTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface FeelingsTabContentProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  emotions: CustomEmotion[];
  textSettings?: TextSettings;
  onModeChange: (mode: BodyMapperMode) => void;
  onEmotionColorChange: (index: number, color: string) => void;
  onEmotionNameChange: (index: number, name: string) => void;
  onEmotionSelect: (color: string) => void;
  onAddColor: () => void;
  onDeleteColor: (index: number) => void;
  onBrushSizeChange: (size: number[]) => void;
  onTextSettingsChange?: (settings: Partial<TextSettings>) => void;
}

export const FeelingsTabContent = ({
  mode,
  selectedColor,
  brushSize,
  emotions,
  textSettings,
  onModeChange,
  onEmotionColorChange,
  onEmotionNameChange,
  onEmotionSelect,
  onAddColor,
  onDeleteColor,
  onBrushSizeChange,
  onTextSettingsChange
}: FeelingsTabContentProps) => {
  console.log('🎨 FeelingsTabContent rendering with textSettings:', textSettings, 'onTextSettingsChange:', !!onTextSettingsChange);
  
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Colors & Emotions</h3>
      <div className="subtext-box">
        <p>Identify the feelings you are experiencing, then choose a color that best represents each feeling for you. Use those colors to fill in the body outline.</p>
        <p><strong>Tip:</strong> You can use the colors to show where you feel each emotion or how big or strong that feeling is for you.</p>
      </div>

      <PaintingModeSelector mode={mode} onModeChange={onModeChange} title="Tools" />
      
      {/* Brush Size Control - Only visible in Draw mode */}
      {mode === 'draw' && (
        <BrushSizeControl
          brushSize={brushSize}
          selectedColor={selectedColor}
          onBrushSizeChange={onBrushSizeChange}
        />
      )}

      <EmotionColorManager
        emotions={emotions}
        selectedColor={selectedColor}
        onEmotionColorChange={onEmotionColorChange}
        onEmotionNameChange={onEmotionNameChange}
        onEmotionSelect={onEmotionSelect}
        onAddColor={onAddColor}
        onDeleteColor={onDeleteColor}
      />
      
      {/* Text Controls */}
      {(() => {
        console.log('🎨 Checking text controls render condition:', { textSettings: !!textSettings, onTextSettingsChange: !!onTextSettingsChange });
        return textSettings && onTextSettingsChange ? (
          <div className="mt-6">
            <TextControls
              mode={mode}
              textSettings={textSettings}
              selectedColor={selectedColor}
              onModeChange={onModeChange}
              onTextSettingsChange={onTextSettingsChange}
            />
          </div>
        ) : (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded">
            DEBUG: Text controls not showing - textSettings: {textSettings ? 'exists' : 'missing'}, onTextSettingsChange: {onTextSettingsChange ? 'exists' : 'missing'}
          </div>
        );
      })()}
    </div>
  );
};
