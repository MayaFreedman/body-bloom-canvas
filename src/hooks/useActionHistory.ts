
import { useState, useCallback } from 'react';
import { ActionHistoryItem } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
  currentUserId: string | null;
}

export const useActionHistory = ({ maxHistorySize = 100, currentUserId }: UseActionHistoryProps) => {
  const [state, setState] = useState<{
    items: ActionHistoryItem[];
    currentIndex: number;
  }>({
    items: [],
    currentIndex: -1
  });

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

    setState(prevState => {
      // Remove any items after current index (when undoing then doing new action)
      const newItems = prevState.items.slice(0, prevState.currentIndex + 1);
      newItems.push(newAction);

      // Trim if needed
      if (newItems.length > maxHistorySize) {
        const trimmedItems = newItems.slice(-maxHistorySize);
        const newIndex = trimmedItems.length - 1;
        console.log('📊 Trimmed history, new length:', trimmedItems.length, 'index:', newIndex);
        return {
          items: trimmedItems,
          currentIndex: newIndex
        };
      }

      // Normal case - point to the newly added item
      const newIndex = newItems.length - 1;
      console.log('📊 Set global index to:', newIndex, 'for', newItems.length, 'items');
      return {
        items: newItems,
        currentIndex: newIndex
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('↩️ Global undo called, currentIndex:', state.currentIndex, 'items length:', state.items.length);
    
    // Can't undo if no valid current action
    if (state.currentIndex < 0 || state.currentIndex >= state.items.length) {
      console.log('❌ Cannot undo - currentIndex:', state.currentIndex, 'items length:', state.items.length);
      return null;
    }
    
    const actionToUndo = state.items[state.currentIndex];
    console.log('↩️ Undoing global action:', actionToUndo?.type, 'by user:', actionToUndo?.userId);
    
    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex - 1
    }));
    
    return actionToUndo;
  }, [state.items, state.currentIndex]);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('↪️ Global redo called, currentIndex:', state.currentIndex, 'items length:', state.items.length);
    
    // Can't redo if at end of history
    if (state.currentIndex >= state.items.length - 1) {
      console.log('❌ Cannot redo - at end of history, currentIndex:', state.currentIndex, 'items length:', state.items.length);
      return null;
    }
    
    const newIndex = state.currentIndex + 1;
    const actionToRedo = state.items[newIndex];
    console.log('↪️ Redoing global action:', actionToRedo?.type, 'by user:', actionToRedo?.userId);
    
    setState(prevState => ({
      ...prevState,
      currentIndex: newIndex
    }));
    
    return actionToRedo;
  }, [state.items, state.currentIndex]);

  // Simple bounds checking
  const canUndo = state.currentIndex >= 0 && state.currentIndex < state.items.length;
  const canRedo = state.currentIndex < state.items.length - 1 && state.items.length > 0;

  console.log('🎛️ Global action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'items:', state.items.length, 'index:', state.currentIndex);

  const clearHistory = useCallback(() => {
    console.log('🧹 Clearing global history');
    setState({
      items: [],
      currentIndex: -1
    });
  }, []);

  return {
    items: state.items,
    currentIndex: state.currentIndex,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};
