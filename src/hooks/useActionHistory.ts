
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
      const itemsUpToCurrent = prevState.items.slice(0, prevState.currentIndex + 1);
      const newItems = [...itemsUpToCurrent, newAction];

      // Trim if needed
      const finalItems = newItems.length > maxHistorySize 
        ? newItems.slice(-maxHistorySize)
        : newItems;

      // Always point to the last item after adding
      const newIndex = finalItems.length - 1;
      
      console.log('📊 Updated global history: items:', finalItems.length, 'index:', newIndex);
      
      return {
        items: finalItems,
        currentIndex: newIndex
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    let actionToUndo: ActionHistoryItem | null = null;
    
    setState(prevState => {
      console.log('↩️ Global undo called, currentIndex:', prevState.currentIndex, 'items length:', prevState.items.length);
      
      // Can't undo if we're already at the beginning or no items
      if (prevState.currentIndex < 0 || prevState.items.length === 0) {
        console.log('❌ Cannot undo - at beginning or no items');
        return prevState;
      }
      
      actionToUndo = prevState.items[prevState.currentIndex];
      console.log('↩️ Undoing global action:', actionToUndo?.type, 'by user:', actionToUndo?.userId);
      
      const newIndex = prevState.currentIndex - 1;
      console.log('📊 Setting global index from', prevState.currentIndex, 'to:', newIndex);
      
      return {
        ...prevState,
        currentIndex: newIndex
      };
    });
    
    return actionToUndo;
  }, []);

  const redo = useCallback((): ActionHistoryItem | null => {
    let actionToRedo: ActionHistoryItem | null = null;
    
    setState(prevState => {
      console.log('↪️ Global redo called, currentIndex:', prevState.currentIndex, 'items length:', prevState.items.length);
      
      // Can't redo if we're at the end
      if (prevState.currentIndex >= prevState.items.length - 1) {
        console.log('❌ Cannot redo - at end of history');
        return prevState;
      }
      
      const newIndex = prevState.currentIndex + 1;
      actionToRedo = prevState.items[newIndex];
      console.log('↪️ Redoing global action:', actionToRedo?.type, 'by user:', actionToRedo?.userId);
      
      return {
        ...prevState,
        currentIndex: newIndex
      };
    });
    
    return actionToRedo;
  }, []);

  // Simplified bounds checking - matches the actual undo/redo logic
  const canUndo = state.currentIndex >= 0 && state.items.length > 0;
  const canRedo = state.currentIndex < state.items.length - 1;

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
