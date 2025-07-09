import { useState, useCallback } from 'react';
import { TextMark, TextSettings } from '@/types/textTypes';
import * as THREE from 'three';

interface UseTextManagerProps {
  currentUserId?: string;
  onAddAction?: (action: any) => void;
  onBroadcastTextPlace?: (textMark: Omit<TextMark, 'userId'>) => void;
  onBroadcastTextUpdate?: (textMark: Partial<TextMark> & { id: string }) => void;
  onBroadcastTextDelete?: (textId: string) => void;
}

export const useTextManager = ({ 
  currentUserId, 
  onAddAction,
  onBroadcastTextPlace,
  onBroadcastTextUpdate,
  onBroadcastTextDelete
}: UseTextManagerProps = {}) => {
  const [textMarks, setTextMarks] = useState<TextMark[]>([]);
  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal'
  });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const addTextMark = useCallback((
    position: THREE.Vector3, 
    text: string, 
    surface: 'body' | 'whiteboard',
    color: string
  ) => {
    const newTextMark: TextMark = {
      id: `text-${Date.now()}-${Math.random()}`,
      position: position.clone(),
      text,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      color,
      surface,
      
      fontWeight: textSettings.fontWeight,
      fontStyle: textSettings.fontStyle,
      userId: currentUserId,
      timestamp: Date.now()
    };

    setTextMarks(prev => [...prev, newTextMark]);

    // Broadcast to multiplayer if connected
    onBroadcastTextPlace?.(newTextMark);

    // Add to action history
    onAddAction?.({
      type: 'textPlace',
      data: {
        textMark: newTextMark,
        previousTextMarks: textMarks
      },
      metadata: {
        text: text.substring(0, 20) + (text.length > 20 ? '...' : '')
      }
    });

    return newTextMark;
  }, [textSettings, currentUserId, onAddAction, onBroadcastTextPlace]);

  const updateTextMark = useCallback((id: string, updates: Partial<TextMark>) => {
    const previousState = textMarks.find(mark => mark.id === id);
    
    setTextMarks(prev => prev.map(mark => 
      mark.id === id ? { ...mark, ...updates } : mark
    ));

    // Broadcast updates to multiplayer if connected
    const updatedMark = { id, ...updates };
    onBroadcastTextUpdate?.(updatedMark);

    if (previousState && updates.text !== undefined) {
      onAddAction?.({
        type: 'textEdit',
        data: {
          textMark: { ...previousState, ...updates },
          previousText: previousState.text
        }
      });
    }
  }, [textMarks, onAddAction, onBroadcastTextUpdate]);

  const deleteTextMark = useCallback((id: string) => {
    const markToDelete = textMarks.find(mark => mark.id === id);
    
    setTextMarks(prev => prev.filter(mark => mark.id !== id));

    // Broadcast deletion to multiplayer if connected
    onBroadcastTextDelete?.(id);

    if (markToDelete) {
      onAddAction?.({
        type: 'textDelete',
        data: {
          textMark: markToDelete,
          previousTextMarks: textMarks
        }
      });
    }
  }, [textMarks, onAddAction, onBroadcastTextDelete]);

  const clearAllText = useCallback(() => {
    const previousMarks = [...textMarks];
    setTextMarks([]);
    
    if (previousMarks.length > 0) {
      onAddAction?.({
        type: 'clear',
        data: {
          previousTextMarks: previousMarks
        }
      });
    }
  }, [textMarks, onAddAction]);

  const startEditing = useCallback((id: string) => {
    setEditingTextId(id);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingTextId(null);
  }, []);

  return {
    textMarks,
    textSettings,
    editingTextId,
    setTextMarks,
    setTextSettings,
    addTextMark,
    updateTextMark,
    deleteTextMark,
    clearAllText,
    startEditing,
    stopEditing
  };
};