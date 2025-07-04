import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Keep a ref to the current history for synchronous access
  const historyRef = useRef(history);

  // Update the ref whenever history changes
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

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
    
    const currentHistory = historyRef.current;
    
    if (currentHistory.currentIndex < 0) {
      console.log('Cannot undo - no history or at beginning');
      return null;
    }
    
    const actionToUndo = currentHistory.items[currentHistory.currentIndex];
    console.log('Action to undo:', actionToUndo);
    
    // Update the history state
    setHistory(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1
    }));
    
    return actionToUndo;
  }, []);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('Global redo called');
    
    const currentHistory = historyRef.current;
    
    if (currentHistory.currentIndex >= currentHistory.items.length - 1) {
      console.log('Cannot redo - no history or at end');
      return null;
    }
    
    const newIndex = currentHistory.currentIndex + 1;
    const actionToRedo = currentHistory.items[newIndex];
    console.log('Action to redo:', actionToRedo);
    
    // Update the history state
    setHistory(prev => ({
      ...prev,
      currentIndex: newIndex
    }));
    
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
