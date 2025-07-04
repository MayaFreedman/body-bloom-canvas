
import { useState, useCallback } from 'react';
import { ActionHistoryItem } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
  currentUserId: string | null;
}

export const useActionHistory = ({ maxHistorySize = 50, currentUserId }: UseActionHistoryProps) => {
  const [items, setItems] = useState<ActionHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addAction = useCallback((action: Omit<ActionHistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    console.log('📝 Adding global action:', action.type, 'by user:', currentUserId);
    if (!currentUserId) {
      console.log('⚠️ No currentUserId, skipping action');
      return;
    }

    const newAction: ActionHistoryItem = {
      ...action,
      id: `action-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      userId: currentUserId
    };

    console.log('✅ New global action created:', newAction.type, 'with id:', newAction.id);

    setItems(prev => {
      // Remove any items after current index (when undoing then doing new action)
      const newItems = prev.slice(0, currentIndex + 1);
      newItems.push(newAction);

      // Trim history if it exceeds max size
      if (newItems.length > maxHistorySize) {
        newItems.shift();
      }

      return newItems;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      console.log('📊 Updated global index to:', newIndex);
      return newIndex;
    });
  }, [maxHistorySize, currentUserId, currentIndex]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('↩️ Global undo called, currentIndex:', currentIndex);
    
    if (currentIndex < 0) {
      console.log('❌ Cannot undo - no history');
      return null;
    }
    
    const actionToUndo = items[currentIndex];
    console.log('↩️ Undoing global action:', actionToUndo?.type, 'by user:', actionToUndo?.userId);
    
    setCurrentIndex(prev => {
      const newIndex = prev - 1;
      console.log('📊 Setting global index to:', newIndex);
      return newIndex;
    });
    
    return actionToUndo;
  }, [items, currentIndex]);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('↪️ Global redo called, currentIndex:', currentIndex);
    
    if (currentIndex >= items.length - 1) {
      console.log('❌ Cannot redo - at end of history');
      return null;
    }
    
    const newIndex = currentIndex + 1;
    const actionToRedo = items[newIndex];
    console.log('↪️ Redoing global action:', actionToRedo?.type, 'by user:', actionToRedo?.userId);
    
    setCurrentIndex(newIndex);
    
    return actionToRedo;
  }, [items, currentIndex]);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < items.length - 1;

  console.log('🎛️ Global action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'items:', items.length, 'index:', currentIndex);

  const clearHistory = useCallback(() => {
    setItems([]);
    setCurrentIndex(-1);
  }, []);

  return {
    items,
    currentIndex,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};
