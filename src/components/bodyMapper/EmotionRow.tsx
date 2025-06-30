
import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EmotionRowProps {
  color: string;
  emotion: string;
  placeholder?: string;
  onColorChange: (color: string) => void;
  onEmotionChange: (emotion: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export const EmotionRow = ({
  color,
  emotion,
  placeholder = "Enter emotion",
  onColorChange,
  onEmotionChange,
  isSelected,
  onSelect
}: EmotionRowProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="flex items-center space-x-3 mb-3 group">
      {/* Color Circle */}
      <button
        className={`w-12 h-12 rounded-full border-3 transition-all hover:scale-105 hover:shadow-lg ${
          isSelected ? 'border-gray-800 shadow-lg scale-105' : 'border-gray-300'
        }`}
        style={{ backgroundColor: color }}
        onClick={onSelect}
      />
      
      {/* Color Picker Icon */}
      <div className="relative">
        <button
          className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 hover:shadow-md transition-all group-hover:scale-110"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette className="w-4 h-4 text-gray-600" />
        </button>
        
        {showColorPicker && (
          <div className="absolute top-10 left-0 z-50 bg-white border border-gray-300 rounded-lg p-3 shadow-xl">
            <div className="grid grid-cols-6 gap-2 mb-3">
              {[
                '#ffeb3b', '#2196f3', '#f44336', '#4caf50', '#9c27b0', '#ff9800',
                '#e91e63', '#00bcd4', '#8bc34a', '#ffc107', '#673ab7', '#795548',
                '#607d8b', '#3f51b5', '#009688', '#cddc39', '#ff5722', '#9e9e9e'
              ].map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    onColorChange(presetColor);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        )}
      </div>
      
      {/* Emotion Input */}
      <Input
        value={emotion}
        placeholder={placeholder}
        onChange={(e) => onEmotionChange(e.target.value)}
        className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 text-base hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  );
};
