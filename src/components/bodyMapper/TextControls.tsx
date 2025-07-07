import React from 'react';
import { Type, Bold, Italic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextSettings } from '@/types/textTypes';
import { BodyMapperMode } from '@/types/bodyMapperTypes';

interface TextControlsProps {
  mode: BodyMapperMode;
  textSettings: TextSettings;
  onModeChange: (mode: BodyMapperMode) => void;
  onTextSettingsChange: (settings: Partial<TextSettings>) => void;
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
  onModeChange,
  onTextSettingsChange
}: TextControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Text Mode Button */}
      <Button
        variant={mode === 'text' ? 'default' : 'outline'}
        className="w-full justify-start gap-2"
        onClick={() => onModeChange(mode === 'text' ? 'draw' : 'text')}
      >
        <Type className="w-4 h-4" />
        Text Tool
      </Button>

      {mode === 'text' && (
        <div className="space-y-4 pl-4 border-l-2 border-border">
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

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <Select
              value={textSettings.fontFamily}
              onValueChange={(value) => onTextSettingsChange({ fontFamily: value })}
            >
              <SelectTrigger>
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
          </div>

          {/* Font Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <div className="flex gap-2">
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
    </div>
  );
};