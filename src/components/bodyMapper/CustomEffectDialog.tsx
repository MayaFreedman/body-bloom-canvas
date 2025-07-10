import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomEffectForm, AVAILABLE_ICONS, AvailableIcon } from '@/types/customEffectTypes';

// Import only the selected PNG images from the reference
import flowerImg from '@/Assets/particleEffects/flower.png';
import tornadoImg from '@/Assets/particleEffects/tornado.png';
import chickenImg from '@/Assets/particleEffects/chicken.png';
import stormImg from '@/Assets/particleEffects/storm.png';
import explosionImg from '@/Assets/particleEffects/explosion.png';
import supportheartImg from '@/Assets/particleEffects/supportheart.png';
import baloonImg from '@/Assets/particleEffects/baloon.png';
import musicalNoteImg from '@/Assets/particleEffects/musical-note.png';
import catImg from '@/Assets/particleEffects/cat.png';
import dogImg from '@/Assets/particleEffects/dog.png';
import racecarImg from '@/Assets/particleEffects/racecar.png';
import rollerCoasterImg from '@/Assets/particleEffects/roller-coaster.png';
import brokenHeartImg from '@/Assets/particleEffects/broken-heart.png';
import robotImg from '@/Assets/particleEffects/robot.png';
import bicepsImg from '@/Assets/particleEffects/biceps.png';
import createImg from '@/Assets/particleEffects/create.png';
import wingsImg from '@/Assets/particleEffects/wings.png';
import alarmImg from '@/Assets/particleEffects/alarm.png';
import lightbulbImg from '@/Assets/particleEffects/lightbulb.png';
import spaceshipImg from '@/Assets/particleEffects/spaceship.png';
import shieldImg from '@/Assets/particleEffects/shield.png';

interface CustomEffectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEffect: (effect: CustomEffectForm) => void;
}

const ICON_IMAGES = {
  flower: flowerImg,
  tornado: tornadoImg,
  chicken: chickenImg,
  storm: stormImg,
  explosion: explosionImg,
  supportheart: supportheartImg,
  baloon: baloonImg,
  'musical-note': musicalNoteImg,
  cat: catImg,
  dog: dogImg,
  racecar: racecarImg,
  'roller-coaster': rollerCoasterImg,
  'broken-heart': brokenHeartImg,
  robot: robotImg,
  biceps: bicepsImg,
  create: createImg,
  wings: wingsImg,
  alarm: alarmImg,
  lightbulb: lightbulbImg,
  spaceship: spaceshipImg,
  shield: shieldImg,
} as const;

const MOVEMENT_BEHAVIORS = [
  { id: 'gentle', name: 'Gentle', description: 'Slow, calm movements' },
  { id: 'moderate', name: 'Moderate', description: 'Balanced movement speed' },
  { id: 'energetic', name: 'Energetic', description: 'Fast, dynamic movements' },
] as const;

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
];

export const CustomEffectDialog: React.FC<CustomEffectDialogProps> = ({
  open,
  onOpenChange,
  onCreateEffect,
}) => {
  const [form, setForm] = useState<CustomEffectForm>({
    name: '',
    selectedIcon: 'flower', // Changed to first available icon
    color: '#ef4444',
    movementBehavior: 'moderate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      onCreateEffect(form);
      setForm({
        name: '',
        selectedIcon: 'flower', // Updated to use available icon
        color: '#ef4444',
        movementBehavior: 'moderate',
      });
      onOpenChange(false);
    }
  };

  const updateForm = (updates: Partial<CustomEffectForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Particle Effect</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div className="flex flex-col items-center p-3 border rounded-lg bg-muted/20">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 p-1"
              style={{ backgroundColor: form.color + '20', border: `2px solid ${form.color}` }}
            >
              <img 
                src={ICON_IMAGES[form.selectedIcon as AvailableIcon]} 
                alt={form.selectedIcon}
                className="w-6 h-6 object-contain"
                style={{ filter: `hue-rotate(${form.color === '#ef4444' ? '0' : '180'}deg)` }}
              />
            </div>
            <p className="text-sm font-medium">{form.name || 'Custom Effect'}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {form.movementBehavior} movement
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm">Effect Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Enter effect name..."
              maxLength={20}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Select Icon</Label>
            <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto border rounded p-2">
              {AVAILABLE_ICONS.map((iconKey) => {
                const isSelected = form.selectedIcon === iconKey;
                
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => updateForm({ selectedIcon: iconKey })}
                    className={`p-2 rounded border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <img 
                      src={ICON_IMAGES[iconKey]} 
                      alt={iconKey}
                      className="w-4 h-4 object-contain mx-auto"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-1">
            <Label className="text-sm">Color</Label>
            <div className="flex items-center gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateForm({ color })}
                  className={`w-5 h-5 rounded border ${
                    form.color === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => updateForm({ color: e.target.value })}
                className="w-5 h-5 rounded border cursor-pointer ml-1"
              />
            </div>
          </div>

          {/* Movement Behavior */}
          <div className="space-y-2">
            <Label className="text-sm">Movement Behavior</Label>
            <div className="space-y-1">
              {MOVEMENT_BEHAVIORS.map((behavior) => (
                <label
                  key={behavior.id}
                  className={`flex items-start p-2 rounded border cursor-pointer transition-all ${
                    form.movementBehavior === behavior.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="movement"
                    value={behavior.id}
                    checked={form.movementBehavior === behavior.id}
                    onChange={(e) => updateForm({ movementBehavior: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{behavior.name}</div>
                    <div className="text-xs text-muted-foreground">{behavior.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim()}
              className="flex-1"
            >
              Create Effect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};