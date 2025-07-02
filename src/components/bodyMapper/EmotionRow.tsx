
import React from 'react';
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
    <div 
      className="flex items-center space-x-4 group hover:bg-[rgb(249,249,249)] p-2 rounded-lg transition-colors duration-200"
    >
      {/* Color Circle */}
      <button
        className={`rounded-full transition-all hover:scale-105 ${
          isSelected ? 'scale-105' : ''
        }`}
        style={{ 
          backgroundColor: color,
          boxShadow: isSelected 
            ? '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 2px black' 
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '40px',
          height: '40px'
        }}
        onClick={onSelect}
      />
      
      {/* Color Picker - Native HTML with Paint Palette Emoji */}
      <div className="relative">
        <label 
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-500 transition-all group-hover:scale-110 cursor-pointer"
          style={{ 
            backgroundColor: 'rgb(224, 224, 224)',
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px'
          }}
        >
          <span className="text-white text-sm">🎨</span>
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
