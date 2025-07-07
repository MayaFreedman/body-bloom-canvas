import { useState, useCallback } from 'react';
import { TextMark } from '@/types/textTypes';
import * as THREE from 'three';

interface UseTextIntegrationProps {
  textMarks: TextMark[];
  editingTextId: string | null;
  selectedColor: string;
  drawingTarget: 'body' | 'whiteboard';
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
    setPendingTextPosition({ position: position.clone(), surface });
    // Auto-start editing with a default text
    const newMark = onAddTextMark(position, 'Click to edit text', surface, selectedColor);
    onStartTextEditing(newMark.id);
  }, [onAddTextMark, selectedColor, onStartTextEditing]);

  const handleTextClick = useCallback((textMark: TextMark) => {
    console.log('📝 Text clicked for editing:', textMark.id);
    onStartTextEditing(textMark.id);
  }, [onStartTextEditing]);

  const handleTextSave = useCallback((text: string) => {
    if (editingTextId) {
      console.log('📝 Saving text:', text, 'for ID:', editingTextId);
      onUpdateTextMark(editingTextId, { text });
      onStopTextEditing();
      setPendingTextPosition(null);
    }
  }, [editingTextId, onUpdateTextMark, onStopTextEditing]);

  const handleTextCancel = useCallback(() => {
    if (editingTextId) {
      // If this was a new text that was just placed, remove it
      const editingMark = textMarks.find(mark => mark.id === editingTextId);
      if (editingMark && editingMark.text === 'Click to edit text') {
        onDeleteTextMark(editingTextId);
      }
      onStopTextEditing();
      setPendingTextPosition(null);
    }
  }, [editingTextId, textMarks, onDeleteTextMark, onStopTextEditing]);

  const handleTextDelete = useCallback(() => {
    if (editingTextId) {
      console.log('📝 Deleting text with ID:', editingTextId);
      onDeleteTextMark(editingTextId);
      onStopTextEditing();
      setPendingTextPosition(null);
    }
  }, [editingTextId, onDeleteTextMark, onStopTextEditing]);

  return {
    handleTextPlace,
    handleTextClick,
    handleTextSave,
    handleTextCancel,
    handleTextDelete,
    pendingTextPosition
  };
};