
import { useState, useCallback } from 'react';
import { GlobalActionHistory, ActionHistoryItem } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
}

export const useActionHistory = ({ maxHistorySize = 50 }: UseActionHistoryProps = {}) => {
  const [history, setHistory] = useState<GlobalActionHistory>({
    items: [],
    currentIndex: -1,
    maxHistorySize
  });

  const addAction = useCallback((action: Omit<ActionHistoryItem, 'id' | 'timestamp'>) => {
    console.log('Adding action to global history:', action);

    setHistory(prev => {
      const newAction: ActionHistoryItem = {
        ...action,
        id: `action-${Date.now()}-${Math.random()}`,
        timestamp: Date.now()
      };

      console.log('New action created:', newAction);

      // Remove any items after current index (when undoing then doing new action)
      const newItems = prev.items.slice(0, prev.currentIndex + 1);
      newItems.push(newAction);

      // Trim history if it exceeds max size
      if (newItems.length > maxHistorySize) {
        newItems.shift();
      }

      const updatedHistory: GlobalActionHistory = {
        ...prev,
        items: newItems,
        currentIndex: newItems.length - 1
      };

      console.log('Updated global history:', updatedHistory);
      return updatedHistory;
    });
  }, [maxHistorySize]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('Global undo called');
    
    let actionToUndo: ActionHistoryItem | null = null;
    
    setHistory(prev => {
      if (prev.currentIndex < 0) {
        console.log('Cannot undo - no history or at beginning');
        return prev;
      }
      
      actionToUndo = prev.items[prev.currentIndex];
      console.log('Action to undo:', actionToUndo);
      
      return {
        ...prev,
        currentIndex: prev.currentIndex - 1
      };
    });
    
    return actionToUndo;
  }, []);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('Global redo called');
    
    let actionToRedo: ActionHistoryItem | null = null;
    
    setHistory(prev => {
      if (prev.currentIndex >= prev.items.length - 1) {
        console.log('Cannot redo - no history or at end');
        return prev;
      }
      
      const newIndex = prev.currentIndex + 1;
      actionToRedo = prev.items[newIndex];
      console.log('Action to redo:', actionToRedo);
      
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
    
    return actionToRedo;
  }, []);

  const canUndo = history.currentIndex >= 0;
  const canRedo = history.currentIndex < history.items.length - 1;

  console.log('Action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'currentIndex:', history.currentIndex, 'totalItems:', history.items.length);

  const clearHistory = useCallback(() => {
    setHistory({
      items: [],
      currentIndex: -1,
      maxHistorySize
    });
  }, [maxHistorySize]);

  return {
    history,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};
