import React, { useState } from 'react';
import { Type, Bold, Italic, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
                className={`flex-1 border border-foreground/20 rounded-lg px-4 py-2 text-base text-foreground placeholder:text-muted-foreground hover:border-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
                onBlur={validateText}
              />
            </div>
          </div>

          {/* Font Size and Style Controls in one row */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h5 className="font-medium text-gray-800 text-[16px] whitespace-nowrap">Size:</h5>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onTextSettingsChange({ fontSize: Math.max(10, textSettings.fontSize - 1) })}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={textSettings.fontSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || textSettings.fontSize;
                    onTextSettingsChange({ fontSize: value });
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 10;
                    const clampedValue = Math.max(10, Math.min(48, value));
                    onTextSettingsChange({ fontSize: clampedValue });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt(e.currentTarget.value) || 10;
                      const clampedValue = Math.max(10, Math.min(48, value));
                      onTextSettingsChange({ fontSize: clampedValue });
                      e.currentTarget.blur();
                    }
                  }}
                  min={10}
                  max={48}
                  className="w-16 h-8 text-center border border-foreground/20 rounded-lg px-4 py-2 text-base text-foreground hover:border-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onTextSettingsChange({ fontSize: Math.min(48, textSettings.fontSize + 1) })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Style Buttons - Bold and Italic inline */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant={textSettings.fontWeight === 'bold' ? 'navy' : 'outline'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => onTextSettingsChange({ 
                    fontWeight: textSettings.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant={textSettings.fontStyle === 'italic' ? 'navy' : 'outline'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => onTextSettingsChange({ 
                    fontStyle: textSettings.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
};