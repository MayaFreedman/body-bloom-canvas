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
  textToPlace = 'Sample Text',
  onTextToPlaceChange
}: TextControlsProps) => {
  const [localTextToPlace, setLocalTextToPlace] = useState(textToPlace);

  const handleTextChange = (text: string) => {
    setLocalTextToPlace(text);
    onTextToPlaceChange?.(text);
  };

  const currentText = onTextToPlaceChange ? (textToPlace || localTextToPlace) : localTextToPlace;

  return (
    <>
      {mode === 'text' && (
        <div className="space-y-4">
          {/* Instructions - moved to top */}
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            Click anywhere on active drawing field to place your text
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text to Place</label>
            <Input
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter text..."
              className="w-full"
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size: {textSettings.fontSize}px</label>
            <Slider
              value={[textSettings.fontSize]}
              onValueChange={([value]) => onTextSettingsChange({ fontSize: value })}
              min={10}
              max={48}
              step={1}
              className="w-full"
            />
          </div>

          {/* Font Family and Style in one row */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font & Style</label>
            <div className="flex gap-2 items-center">
              {/* Font Family */}
              <Select
                value={textSettings.fontFamily}
                onValueChange={(value) => onTextSettingsChange({ fontFamily: value })}
              >
                <SelectTrigger className="flex-1">
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
              
              {/* Style Buttons */}
              <Button
                variant={textSettings.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTextSettingsChange({ 
                  fontWeight: textSettings.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={textSettings.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
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