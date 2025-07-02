
import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmotionRow } from './EmotionRow';

interface CustomEmotion {
  color: string;
  name: string;
}

interface EmotionColorManagerProps {
  emotions: CustomEmotion[];
  selectedColor: string;
  onEmotionColorChange: (index: number, color: string) => void;
  onEmotionNameChange: (index: number, name: string) => void;
  onEmotionSelect: (color: string) => void;
  onAddColor: () => void;
  onDeleteColor: (index: number) => void;
}

export const EmotionColorManager = ({
  emotions,
  selectedColor,
  onEmotionColorChange,
  onEmotionNameChange,
  onEmotionSelect,
  onAddColor,
  onDeleteColor
}: EmotionColorManagerProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-4">Colors & Emotions</h4>
      <div className="space-y-4">
        {emotions.map((emotion, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1">
              <EmotionRow
                color={emotion.color}
                emotion={emotion.name}
                placeholder={index < 3 ? ['Joy', 'Sadness', 'Anger'][index] : 'Enter emotion'}
                onColorChange={(color) => onEmotionColorChange(index, color)}
                onEmotionChange={(name) => onEmotionNameChange(index, name)}
                isSelected={selectedColor === emotion.color}
                onSelect={() => onEmotionSelect(emotion.color)}
              />
            </div>
            {/* Delete button - only show for colors beyond the base 8 */}
            {index >= 8 && (
              <button
                onClick={() => onDeleteColor(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Delete this color"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Color Button */}
      <div className="mt-4">
        <Button
          onClick={onAddColor}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          ADD COLOR
        </Button>
      </div>
    </div>
  );
};
