
import { useState, useCallback } from 'react';
import { ActionHistoryItem } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
  currentUserId: string | null;
}

export const useActionHistory = ({ maxHistorySize = 100, currentUserId }: UseActionHistoryProps) => {
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

      // Only trim history if it gets reasonably long (100+ items)
      if (newItems.length > maxHistorySize) {
        const trimmedItems = newItems.slice(-maxHistorySize);
        console.log('📊 Trimmed history (reached 100+ items), new length:', trimmedItems.length);
        // Set currentIndex to point to the last item in trimmed array
        setCurrentIndex(trimmedItems.length - 1);
        console.log('📊 Set global index to:', trimmedItems.length - 1, 'after trimming');
        return trimmedItems;
      }

      // Normal case - set index to point to the newly added item (last item)
      setCurrentIndex(newItems.length - 1);
      console.log('📊 Set global index to:', newItems.length - 1, 'for', newItems.length, 'items');
      return newItems;
    });
  }, [maxHistorySize, currentUserId, currentIndex]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('↩️ Global undo called, currentIndex:', currentIndex, 'items length:', items.length);
    
    // Can undo if currentIndex is valid (>= 0) and within items array
    if (currentIndex < 0 || currentIndex >= items.length) {
      console.log('❌ Cannot undo - currentIndex:', currentIndex, 'items length:', items.length);
      return null;
    }
    
    const actionToUndo = items[currentIndex];
    console.log('↩️ Undoing global action:', actionToUndo?.type, 'by user:', actionToUndo?.userId);
    
    setCurrentIndex(prev => {
      const newIndex = prev - 1;
      console.log('📊 Setting global index from', prev, 'to:', newIndex);
      return newIndex;
    });
    
    return actionToUndo;
  }, [items, currentIndex]);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('↪️ Global redo called, currentIndex:', currentIndex, 'items length:', items.length);
    
    // Can redo if there are items after currentIndex
    if (currentIndex >= items.length - 1) {
      console.log('❌ Cannot redo - at end of history, currentIndex:', currentIndex, 'items length:', items.length);
      return null;
    }
    
    const newIndex = currentIndex + 1;
    const actionToRedo = items[newIndex];
    console.log('↪️ Redoing global action:', actionToRedo?.type, 'by user:', actionToRedo?.userId);
    
    setCurrentIndex(newIndex);
    
    return actionToRedo;
  }, [items, currentIndex]);

  // Fixed: canUndo should check if currentIndex >= 0 AND within bounds
  const canUndo = currentIndex >= 0 && currentIndex < items.length;
  // Fixed: canRedo should check if there are actions after currentIndex
  const canRedo = currentIndex < items.length - 1 && items.length > 0;

  console.log('🎛️ Global action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'items:', items.length, 'index:', currentIndex);

  const clearHistory = useCallback(() => {
    console.log('🧹 Clearing global history');
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
