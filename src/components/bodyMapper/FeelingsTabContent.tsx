
import React from 'react';
import { PaintingModeSelector } from './PaintingModeSelector';
import { EmotionColorManager } from './EmotionColorManager';
import { BrushSizeControl } from './BrushSizeControl';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface FeelingsTabContentProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  emotions: CustomEmotion[];
  onModeChange: (mode: BodyMapperMode) => void;
  onEmotionColorChange: (index: number, color: string) => void;
  onEmotionNameChange: (index: number, name: string) => void;
  onEmotionSelect: (color: string) => void;
  onAddColor: () => void;
  onDeleteColor: (index: number) => void;
  onBrushSizeChange: (size: number[]) => void;
}

export const FeelingsTabContent = ({
  mode,
  selectedColor,
  brushSize,
  emotions,
  onModeChange,
  onEmotionColorChange,
  onEmotionNameChange,
  onEmotionSelect,
  onAddColor,
  onDeleteColor,
  onBrushSizeChange
}: FeelingsTabContentProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Colors & Emotions</h3>
      <div className="subtext-box">
        <p>Identify the feelings you are experiencing, then choose a color that best represents each feeling for you. Use those colors to fill in the body outline.</p>
        <p><strong>Tip:</strong> You can use the colors to show where you feel each emotion or how big or strong that feeling is for you.</p>
      </div>

      <PaintingModeSelector mode={mode} onModeChange={onModeChange} />
      
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
    </div>
  );
};
