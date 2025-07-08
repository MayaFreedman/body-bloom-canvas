import React from 'react';
import { Settings, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BodyMapperControls } from './BodyMapperControls';
import { BodyMapperMode, SelectedSensation } from '@/types/bodyMapperTypes';
import { TextSettings } from '@/types/textTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface EmotionUpdate {
  type: 'emotionColorChange' | 'emotionNameChange' | 'emotionsInit' | 'addEmotion' | 'deleteEmotion';
  index?: number;
  value?: string;
  emotions?: CustomEmotion[];
  emotion?: CustomEmotion;
}

interface AppSidebarProps {
  mode: BodyMapperMode;
  selectedColor: string;
  brushSize: number[];
  selectedSensation: SelectedSensation | null;
  textSettings?: TextSettings;
  textToPlace?: string;
  drawingTarget?: 'body' | 'whiteboard';
  controlsRef: React.RefObject<any>;
  onModeChange: (mode: BodyMapperMode) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number[]) => void;
  onSensationChange: (sensation: SelectedSensation | null) => void;
  onTextSettingsChange?: (settings: Partial<TextSettings>) => void;
  onTextToPlaceChange?: (text: string) => void;
  onDrawingTargetChange?: (target: 'body' | 'whiteboard') => void;
  onEmotionsUpdate?: (update: EmotionUpdate) => void;
}

export function AppSidebar({
  mode,
  selectedColor,
  brushSize,
  selectedSensation,
  textSettings,
  textToPlace,
  drawingTarget,
  controlsRef,
  onModeChange,
  onColorChange,
  onBrushSizeChange,
  onSensationChange,
  onTextSettingsChange,
  onTextToPlaceChange,
  onDrawingTargetChange,
  onEmotionsUpdate
}: AppSidebarProps) {
  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Controls</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-4">
        <BodyMapperControls
          ref={controlsRef}
          mode={mode}
          selectedColor={selectedColor}
          brushSize={brushSize}
          selectedSensation={selectedSensation}
          drawingTarget={drawingTarget}
          textSettings={textSettings}
          textToPlace={textToPlace}
          onModeChange={onModeChange}
          onColorChange={onColorChange}
          onBrushSizeChange={onBrushSizeChange}
          onSensationChange={onSensationChange}
          onDrawingTargetChange={onDrawingTargetChange}
          onTextSettingsChange={onTextSettingsChange}
          onTextToPlaceChange={onTextToPlaceChange}
          onEmotionsUpdate={onEmotionsUpdate}
        />
      </SidebarContent>
    </Sidebar>
  );
}