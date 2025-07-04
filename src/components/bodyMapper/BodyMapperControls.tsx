
import React, { useState, useEffect, forwardRef } from 'react';
import { TabContainer } from './TabContainer';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface EmotionUpdate {
  type: 'emotionColorChange' | 'emotionNameChange' | 'emotionsInit' | 'addEmotion' | 'deleteEmotion';
  index?: number;
  value?: string;
  emotions?: CustomEmotion[];
  emotion?: CustomEmotion;
}

interface BodyMapperControlsProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  selectedSensation: SelectedSensation | null;
  onModeChange: (mode: BodyMapperMode) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number[]) => void;
  onSensationChange: (sensation: SelectedSensation) => void;
  onEmotionsUpdate?: (update: EmotionUpdate) => void;
}

const defaultEmotions: CustomEmotion[] = [
  { color: '#ffeb3b', name: 'Joy' },
  { color: '#2196f3', name: 'Sadness' },
  { color: '#f44336', name: 'Anger' },
  { color: '#4caf50', name: '' },
  { color: '#9c27b0', name: '' },
  { color: '#ff9800', name: '' },
  { color: '#e91e63', name: '' },
  { color: '#00bcd4', name: '' }
];

export const BodyMapperControls = React.forwardRef<
  { handleIncomingEmotionUpdate: (updateData: { type: string; index?: number; value?: string; emotion?: CustomEmotion }) => void },
  BodyMapperControlsProps
>(({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  onModeChange,
  onColorChange,
  onBrushSizeChange,
  onSensationChange,
  onEmotionsUpdate
}, ref) => {
  const [activeTab, setActiveTab] = useState('feelings');
  const [emotions, setEmotions] = useState<CustomEmotion[]>(defaultEmotions);

  const handleEmotionColorChange = (index: number, color: string) => {
    const newEmotions = [...emotions];
    newEmotions[index] = { ...newEmotions[index], color };
    setEmotions(newEmotions);
    
    onEmotionsUpdate?.({
      type: 'emotionColorChange',
      index,
      value: color
    });
  };

  const handleEmotionNameChange = (index: number, name: string) => {
    const newEmotions = [...emotions];
    newEmotions[index] = { ...newEmotions[index], name };
    setEmotions(newEmotions);
    
    onEmotionsUpdate?.({
      type: 'emotionNameChange',
      index,
      value: name
    });
  };

  const handleEmotionSelect = (color: string) => {
    onColorChange(color);
  };

  const handleAddColor = () => {
    const colors = ['#8bc34a', '#607d8b', '#795548', '#ff5722', '#3f51b5', '#009688', '#cddc39', '#ffc107'];
    const nextColor = colors[emotions.length % colors.length];
    
    const newEmotion: CustomEmotion = {
      color: nextColor,
      name: ''
    };
    
    const newEmotions = [...emotions, newEmotion];
    setEmotions(newEmotions);
    
    onEmotionsUpdate?.({
      type: 'addEmotion',
      emotion: newEmotion
    });
  };

  const handleDeleteColor = (index: number) => {
    if (index < 8) return;
    
    const newEmotions = emotions.filter((_, i) => i !== index);
    setEmotions(newEmotions);
    
    onEmotionsUpdate?.({
      type: 'deleteEmotion',
      index
    });
  };

  const handleIncomingEmotionUpdate = (updateData: { type: string; index?: number; value?: string; emotion?: CustomEmotion }) => {
    setEmotions(prevEmotions => {
      if (updateData.type === 'addEmotion' && updateData.emotion) {
        return [...prevEmotions, updateData.emotion];
      }
      
      if (updateData.type === 'deleteEmotion' && updateData.index !== undefined) {
        return prevEmotions.filter((_, i) => i !== updateData.index);
      }
      
      if (updateData.index !== undefined) {
        const newEmotions = [...prevEmotions];
        
        if (updateData.type === 'emotionColorChange') {
          newEmotions[updateData.index] = { ...newEmotions[updateData.index], color: updateData.value || '' };
        } else if (updateData.type === 'emotionNameChange') {
          newEmotions[updateData.index] = { ...newEmotions[updateData.index], name: updateData.value || '' };
        }
        
        return newEmotions;
      }
      
      return prevEmotions;
    });
  };

  React.useImperativeHandle(ref, () => ({
    handleIncomingEmotionUpdate
  }));

  useEffect(() => {
    onEmotionsUpdate?.({
      type: 'emotionsInit',
      emotions: emotions
    });
  }, []);

  return (
    <TabContainer 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      mode={mode}
      selectedColor={selectedColor}
      brushSize={brushSize}
      emotions={emotions}
      onModeChange={onModeChange}
      onEmotionColorChange={handleEmotionColorChange}
      onEmotionNameChange={handleEmotionNameChange}
      onEmotionSelect={handleEmotionSelect}
      onAddColor={handleAddColor}
      onDeleteColor={handleDeleteColor}
      onBrushSizeChange={onBrushSizeChange}
      selectedSensation={selectedSensation}
      onSensationChange={onSensationChange}
    >
      <div />
    </TabContainer>
  );
});

BodyMapperControls.displayName = 'BodyMapperControls';
