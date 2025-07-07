
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
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">Colors & Emotions</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Choose colors that represent your feelings and use them to fill in the body outline.
        </p>
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

      {/* Text Controls - Only visible in Text mode */}
      {mode === 'text' && textSettings && onTextSettingsChange && (
        <TextControls
          mode={mode}
          textSettings={textSettings}
          selectedColor={selectedColor}
          onModeChange={onModeChange}
          onTextSettingsChange={onTextSettingsChange}
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
    </div>
  );
};
