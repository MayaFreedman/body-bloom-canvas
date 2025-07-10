import React, { useState } from 'react';
import { Type, Bold, Italic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextSettings } from '@/types/textTypes';
import { BodyMapperMode } from '@/types/bodyMapperTypes';

interface TextControlsProps {
  mode: BodyMapperMode;
  textSettings: TextSettings;
  selectedColor: string;
  onModeChange: (mode: BodyMapperMode) => void;
  onTextSettingsChange: (settings: Partial<TextSettings>) => void;
  textToPlace?: string;
  onTextToPlaceChange?: (text: string) => void;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New'
];

export const TextControls = ({
  mode,
  textSettings,
  selectedColor,
  onModeChange,
  onTextSettingsChange,
  textToPlace = '',
  onTextToPlaceChange
}: TextControlsProps) => {
  const [localTextToPlace, setLocalTextToPlace] = useState(textToPlace);
  const [hasError, setHasError] = useState(false);

  const handleTextChange = (text: string) => {
    setLocalTextToPlace(text);
    onTextToPlaceChange?.(text);
    if (hasError && text.trim()) {
      setHasError(false);
    }
  };

  const validateText = () => {
    const currentText = onTextToPlaceChange ? (textToPlace || localTextToPlace) : localTextToPlace;
    if (!currentText || !currentText.trim()) {
      setHasError(true);
      return false;
    }
    setHasError(false);
    return true;
  };

  const currentText = onTextToPlaceChange ? (textToPlace || localTextToPlace) : localTextToPlace;

  return (
    <>
      {mode === 'text' && (
        <div className="space-y-4">

          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h5 className="font-medium text-gray-800 text-[16px] whitespace-nowrap">Text to Place:</h5>
              <Input
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter your text here..."
                className={`flex-1 ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                onBlur={validateText}
              />
            </div>
            {hasError && (
              <p className="text-xs text-red-500 ml-1">Text field cannot be empty</p>
            )}
          </div>

          {/* Font Size */}
          <div>
            <h5 className="font-medium text-gray-800 text-[16px] mb-3">Size</h5>
            <div className="space-y-3">
              <Slider
                value={[textSettings.fontSize]}
                onValueChange={([value]) => onTextSettingsChange({ fontSize: value })}
                min={10}
                max={48}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-center">
                <span className="text-sm text-gray-600">Size: {textSettings.fontSize}px</span>
              </div>
            </div>
          </div>

          {/* Font Family and Style in one row */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800 text-[16px] mb-2">Font & Style</h5>
            <div className="flex gap-2 items-center">
              {/* Font Family */}
              <Select
                value={textSettings.fontFamily}
                onValueChange={(value) => onTextSettingsChange({ fontFamily: value })}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Style Buttons - matching height */}
              <Button
                variant={textSettings.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                className="h-9 px-3"
                onClick={() => onTextSettingsChange({ 
                  fontWeight: textSettings.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={textSettings.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                className="h-9 px-3"
                onClick={() => onTextSettingsChange({ 
                  fontStyle: textSettings.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};