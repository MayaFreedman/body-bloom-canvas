
import React from 'react';
import { PaintingModeSelector } from './PaintingModeSelector';
import { EmotionColorManager } from './EmotionColorManager';
import { BrushSizeControl } from './BrushSizeControl';
import { DrawingTargetSelector } from './DrawingTargetSelector';
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
  textToPlace?: string;
  drawingTarget?: 'body' | 'whiteboard';
  onModeChange: (mode: BodyMapperMode) => void;
  onEmotionColorChange: (index: number, color: string) => void;
  onEmotionNameChange: (index: number, name: string) => void;
  onEmotionSelect: (color: string) => void;
  onAddColor: () => void;
  onDeleteColor: (index: number) => void;
  onBrushSizeChange: (size: number[]) => void;
  onTextSettingsChange?: (settings: Partial<TextSettings>) => void;
  onTextToPlaceChange?: (text: string) => void;
  onDrawingTargetChange?: (target: 'body' | 'whiteboard') => void;
}

export const FeelingsTabContent = ({
  mode,
  selectedColor,
  brushSize,
  emotions,
  textSettings,
  textToPlace,
  drawingTarget,
  onModeChange,
  onEmotionColorChange,
  onEmotionNameChange,
  onEmotionSelect,
  onAddColor,
  onDeleteColor,
  onBrushSizeChange,
  onTextSettingsChange,
  onTextToPlaceChange,
  onDrawingTargetChange
}: FeelingsTabContentProps) => {
  
  return (
    <div className="space-y-4">
      {/* Colors & Emotions Header and Description */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Colors & Emotions</h3>
        <div className="subtext-box">
          <p>Identify the feelings you are experiencing, then choose a color that best represents each feeling for you. Use those colors to fill in the body outline.</p>
          <p><strong>Tip:</strong> You can use the colors to show where you feel each emotion or how big or strong that feeling is for you.</p>
        </div>
      </div>
      
      {/* Drawing Target Selector - placed above tools */}
      {drawingTarget && onDrawingTargetChange && (
        <DrawingTargetSelector
          drawingTarget={drawingTarget}
          onTargetChange={onDrawingTargetChange}
        />
      )}
      
      {/* Tool Buttons */}
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
          textToPlace={textToPlace}
          onModeChange={onModeChange}
          onTextSettingsChange={onTextSettingsChange}
          onTextToPlaceChange={onTextToPlaceChange}
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
