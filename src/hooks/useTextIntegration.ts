import { useState, useCallback } from 'react';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface UseTextIntegrationProps {
  textMarks: TextMark[];
  editingTextId: string | null;
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
  textToPlace: string;
  onAddTextMark: (position: THREE.Vector3, text: string, surface: 'body' | 'whiteboard', color: string) => TextMark;
  onUpdateTextMark: (id: string, updates: Partial<TextMark>) => void;
  onDeleteTextMark: (id: string) => void;
  onStartTextEditing: (id: string) => void;
  onStopTextEditing: () => void;
}

export const useTextIntegration = ({
  textMarks,
  editingTextId,
  selectedColor,
  drawingTarget,
  textToPlace,
  onAddTextMark,
  onUpdateTextMark,
  onDeleteTextMark,
  onStartTextEditing,
  onStopTextEditing
}: UseTextIntegrationProps) => {
  const [pendingTextPosition, setPendingTextPosition] = useState<{
    position: THREE.Vector3;
    surface: 'body' | 'whiteboard';
  } | null>(null);

  const handleTextPlace = useCallback((position: THREE.Vector3, surface: 'body' | 'whiteboard') => {
    console.log('📝 Text placement requested at:', position, 'on surface:', surface);
    if (textToPlace && textToPlace.trim()) {
      onAddTextMark(position, textToPlace.trim(), surface, selectedColor);
    }
  }, [onAddTextMark, selectedColor, textToPlace]);

  const handleTextClick = useCallback((textMark: TextMark) => {
    // For stamp mode, we don't need inline editing
    console.log('📝 Text clicked:', textMark.id);
  }, []);

  const handleTextSave = useCallback((text: string) => {
    // Not needed for stamp mode
    console.log('📝 Text save not needed in stamp mode');
  }, []);

  const handleTextCancel = useCallback(() => {
    // Not needed for stamp mode
    console.log('📝 Text cancel not needed in stamp mode');
  }, []);

  const handleTextDelete = useCallback(() => {
    // Not needed for stamp mode
    console.log('📝 Text delete not needed in stamp mode');
  }, []);

  return {
    handleTextPlace,
    handleTextClick,
    handleTextSave,
    handleTextCancel,
    handleTextDelete,
    pendingTextPosition: null // Not needed for stamp mode
  };
};