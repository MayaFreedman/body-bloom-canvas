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

// Import all the PNG images
import alarmImg from '@/Assets/particleEffects/alarm.png';
import baloonImg from '@/Assets/particleEffects/baloon.png';
import bicepsImg from '@/Assets/particleEffects/biceps.png';
import brokenHeartImg from '@/Assets/particleEffects/broken-heart.png';
import butterflyImg from '@/Assets/particleEffects/butterfly.png';
import catImg from '@/Assets/particleEffects/cat.png';
import chickenImg from '@/Assets/particleEffects/chicken.png';
import createImg from '@/Assets/particleEffects/create.png';
import desertImg from '@/Assets/particleEffects/desert.png';
import dogImg from '@/Assets/particleEffects/dog.png';
import explosionImg from '@/Assets/particleEffects/explosion.png';
import feetImg from '@/Assets/particleEffects/feet.png';
import feetredImg from '@/Assets/particleEffects/feetred.png';
import fidgetSpinnerImg from '@/Assets/particleEffects/fidget-spinner.png';
import fireImg from '@/Assets/particleEffects/fire.png';
import flowerImg from '@/Assets/particleEffects/flower.png';
import frogImg from '@/Assets/particleEffects/frog.png';
import goosebumpImg from '@/Assets/particleEffects/goosebump.png';
import heartImg from '@/Assets/particleEffects/heart.png';
import lightbulbImg from '@/Assets/particleEffects/lightbulb.png';
import lightningBoltImg from '@/Assets/particleEffects/lightning-bolt.png';
import monkeyImg from '@/Assets/particleEffects/monkey.png';
import musicalNoteImg from '@/Assets/particleEffects/musical-note.png';
import nauticalKnotImg from '@/Assets/particleEffects/nautical-knot.png';
import painImg from '@/Assets/particleEffects/pain.png';
import plateImg from '@/Assets/particleEffects/plate.png';
import plusImg from '@/Assets/particleEffects/plus.png';
import racecarImg from '@/Assets/particleEffects/racecar.png';
import relaxImg from '@/Assets/particleEffects/relax.png';
import resistorImg from '@/Assets/particleEffects/resistor.png';
import robotImg from '@/Assets/particleEffects/robot.png';
import rollerCoasterImg from '@/Assets/particleEffects/roller-coaster.png';
import shakeImg from '@/Assets/particleEffects/shake.png';
import shieldImg from '@/Assets/particleEffects/shield.png';
import snailImg from '@/Assets/particleEffects/snail.png';
import snowflakesImg from '@/Assets/particleEffects/snowflakes.png';
import spaceshipImg from '@/Assets/particleEffects/spaceship.png';
import starImg from '@/Assets/particleEffects/star.png';
import statueImg from '@/Assets/particleEffects/statue.png';
import stoneImg from '@/Assets/particleEffects/stone.png';
import stormImg from '@/Assets/particleEffects/storm.png';
import supportheartImg from '@/Assets/particleEffects/supportheart.png';
import sweatImg from '@/Assets/particleEffects/sweat.png';
import swirlImg from '@/Assets/particleEffects/swirl.png';
import tornadoImg from '@/Assets/particleEffects/tornado.png';
import turtleImg from '@/Assets/particleEffects/turtle.png';
import virusImg from '@/Assets/particleEffects/virus.png';
import waterImg from '@/Assets/particleEffects/water.png';
import wavyImg from '@/Assets/particleEffects/wavy.png';
import windImg from '@/Assets/particleEffects/wind.png';
import wingsImg from '@/Assets/particleEffects/wings.png';
import zzzImg from '@/Assets/particleEffects/zzz.png';

interface CustomEffectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEffect: (effect: CustomEffectForm) => void;
}

const ICON_IMAGES = {
  alarm: alarmImg,
  baloon: baloonImg,
  biceps: bicepsImg,
  'broken-heart': brokenHeartImg,
  butterfly: butterflyImg,
  cat: catImg,
  chicken: chickenImg,
  create: createImg,
  desert: desertImg,
  dog: dogImg,
  explosion: explosionImg,
  feet: feetImg,
  feetred: feetredImg,
  'fidget-spinner': fidgetSpinnerImg,
  fire: fireImg,
  flower: flowerImg,
  frog: frogImg,
  goosebump: goosebumpImg,
  heart: heartImg,
  lightbulb: lightbulbImg,
  'lightning-bolt': lightningBoltImg,
  monkey: monkeyImg,
  'musical-note': musicalNoteImg,
  'nautical-knot': nauticalKnotImg,
  pain: painImg,
  plate: plateImg,
  plus: plusImg,
  racecar: racecarImg,
  relax: relaxImg,
  resistor: resistorImg,
  robot: robotImg,
  'roller-coaster': rollerCoasterImg,
  shake: shakeImg,
  shield: shieldImg,
  snail: snailImg,
  snowflakes: snowflakesImg,
  spaceship: spaceshipImg,
  star: starImg,
  statue: statueImg,
  stone: stoneImg,
  storm: stormImg,
  supportheart: supportheartImg,
  sweat: sweatImg,
  swirl: swirlImg,
  tornado: tornadoImg,
  turtle: turtleImg,
  virus: virusImg,
  water: waterImg,
  wavy: wavyImg,
  wind: windImg,
  wings: wingsImg,
  zzz: zzzImg,
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
    selectedIcon: 'heart',
    color: '#ef4444',
    movementBehavior: 'moderate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      onCreateEffect(form);
      setForm({
        name: '',
        selectedIcon: 'heart',
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