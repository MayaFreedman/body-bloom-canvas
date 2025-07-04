
import React from 'react';
import { FeelingsTabContent } from './FeelingsTabContent';
import { SensationSelector } from './SensationSelector';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface TabContainerProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
  children: React.ReactNode;
  // Props for FeelingsTabContent
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
  // Props for SensationSelector
  selectedSensation: SelectedSensation | null;
  onSensationChange: (sensation: SelectedSensation) => void;
}

export const TabContainer = ({ 
  activeTab, 
  onTabChange, 
  children,
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
  onBrushSizeChange,
  selectedSensation,
  onSensationChange
}: TabContainerProps) => {
  return (
    <div className="tab-container h-full flex flex-col">
      {/* Tab Buttons */}
      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'feelings' ? 'active' : ''}`}
          onClick={() => onTabChange('feelings')}
        >
          Color by Feelings
        </button>
        <button 
          className={`tab-button ${activeTab === 'sensations' ? 'active' : ''}`}
          onClick={() => onTabChange('sensations')}
        >
          Body Sensations and Signals
        </button>
      </div>
      
      {/* Tab Content */}
      <div className={`tab-content ${activeTab === 'feelings' ? 'active' : ''}`}>
        <FeelingsTabContent
          mode={mode}
          selectedColor={selectedColor}
          brushSize={brushSize}
          emotions={emotions}
          onModeChange={onModeChange}
          onEmotionColorChange={onEmotionColorChange}
          onEmotionNameChange={onEmotionNameChange}
          onEmotionSelect={onEmotionSelect}
          onAddColor={onAddColor}
          onDeleteColor={onDeleteColor}
          onBrushSizeChange={onBrushSizeChange}
        />
      </div>

      <div className={`tab-content ${activeTab === 'sensations' ? 'active' : ''}`}>
        <SensationSelector
          mode={mode}
          selectedSensation={selectedSensation}
          onModeChange={onModeChange}
          onSensationChange={onSensationChange}
        />
      </div>
    </div>
  );
};
