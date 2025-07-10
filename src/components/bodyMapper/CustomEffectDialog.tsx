import React, { useState } from 'react';
import { Plus, Heart, Star, Zap, Flame, Droplet, Wind, Snowflake, Flower, Sun, Moon, Sparkles, Circle, Triangle } from 'lucide-react';
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

interface CustomEffectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEffect: (effect: CustomEffectForm) => void;
}

const ICON_COMPONENTS = {
  heart: Heart,
  star: Star,
  'lightning-bolt': Zap,
  fire: Flame,
  water: Droplet,
  wind: Wind,
  snowflakes: Snowflake,
  butterfly: Flower, // Using flower as butterfly substitute
  flower: Flower,
  sun: Sun,
  moon: Moon,
  sparkles: Sparkles,
  circle: Circle,
  triangle: Triangle,
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

  const IconComponent = ICON_COMPONENTS[form.selectedIcon as AvailableIcon];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Particle Effect</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/20">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: form.color + '20', border: `2px solid ${form.color}` }}
            >
              <IconComponent 
                size={24} 
                style={{ color: form.color }}
              />
            </div>
            <p className="text-sm font-medium">{form.name || 'Custom Effect'}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {form.movementBehavior} movement
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Effect Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Enter effect name..."
              maxLength={20}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label>Select Icon</Label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((iconKey) => {
                const IconComp = ICON_COMPONENTS[iconKey];
                const isSelected = form.selectedIcon === iconKey;
                
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => updateForm({ selectedIcon: iconKey })}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <IconComp size={20} className="mx-auto" />
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
          <div className="space-y-3">
            <Label>Movement Behavior</Label>
            <div className="space-y-2">
              {MOVEMENT_BEHAVIORS.map((behavior) => (
                <label
                  key={behavior.id}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
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
          <div className="flex gap-3 pt-4">
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