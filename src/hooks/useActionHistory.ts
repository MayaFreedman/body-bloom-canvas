
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
    console.log('📝 Adding action:', action.type, 'by user:', currentUserId);
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

    setState(prevState => {
      // Remove any items after current index (when undoing then doing new action)
      const itemsUpToCurrent = prevState.items.slice(0, prevState.currentIndex + 1);
      const newItems = [...itemsUpToCurrent, newAction];

      // Trim if needed
      const finalItems = newItems.length > maxHistorySize 
        ? newItems.slice(-maxHistorySize)
        : newItems;

      const newIndex = finalItems.length - 1;
      
      console.log('📊 History updated: items:', finalItems.length, 'index:', newIndex);
      
      return {
        items: finalItems,
        currentIndex: newIndex
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    let actionToUndo: ActionHistoryItem | null = null;
    
    setState(prevState => {
      console.log('↩️ Undo called, currentIndex:', prevState.currentIndex, 'items:', prevState.items.length);
      
      if (prevState.currentIndex < 0 || prevState.items.length === 0) {
        console.log('❌ Cannot undo - no valid actions');
        return prevState;
      }
      
      actionToUndo = prevState.items[prevState.currentIndex];
      console.log('↩️ Undoing action:', actionToUndo?.type);
      
      return {
        ...prevState,
        currentIndex: prevState.currentIndex - 1
      };
    });
    
    return actionToUndo;
  }, []);

  const redo = useCallback((): ActionHistoryItem | null => {
    let actionToRedo: ActionHistoryItem | null = null;
    
    setState(prevState => {
      console.log('↪️ Redo called, currentIndex:', prevState.currentIndex, 'items:', prevState.items.length);
      
      if (prevState.currentIndex >= prevState.items.length - 1) {
        console.log('❌ Cannot redo - at end of history');
        return prevState;
      }
      
      const newIndex = prevState.currentIndex + 1;
      actionToRedo = prevState.items[newIndex];
      console.log('↪️ Redoing action:', actionToRedo?.type);
      
      return {
        ...prevState,
        currentIndex: newIndex
      };
    });
    
    return actionToRedo;
  }, []);

  const canUndo = state.currentIndex >= 0;
  const canRedo = state.currentIndex < state.items.length - 1;

  const clearHistory = useCallback(() => {
    console.log('🧹 Clearing history');
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
