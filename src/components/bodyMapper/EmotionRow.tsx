
import React from 'react';
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
      
      {/* Color Picker - Native HTML */}
      <div className="relative">
        <label className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 hover:shadow-md transition-all group-hover:scale-110 cursor-pointer">
          <Palette className="w-4 h-4 text-gray-600" />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
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
