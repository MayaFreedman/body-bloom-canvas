
import { useState, useCallback, useRef } from 'react';
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

      // Update ref immediately
      historyRef.current = updatedHistory;
      console.log('Updated global history:', updatedHistory);
      return updatedHistory;
    });
  }, [maxHistorySize]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('Global undo called');
    
    if (historyRef.current.currentIndex < 0) {
      console.log('Cannot undo - no history or at beginning');
      return null;
    }
    
    const actionToUndo = historyRef.current.items[historyRef.current.currentIndex];
    console.log('Action to undo:', actionToUndo);
    
    // Update the history state and ref synchronously
    setHistory(prev => {
      const updatedHistory = {
        ...prev,
        currentIndex: prev.currentIndex - 1
      };
      // Update ref immediately within the setter
      historyRef.current = updatedHistory;
      return updatedHistory;
    });
    
    return actionToUndo;
  }, []);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('Global redo called');
    
    if (historyRef.current.currentIndex >= historyRef.current.items.length - 1) {
      console.log('Cannot redo - no history or at end');
      return null;
    }
    
    const newIndex = historyRef.current.currentIndex + 1;
    const actionToRedo = historyRef.current.items[newIndex];
    console.log('Action to redo:', actionToRedo);
    
    // Update the history state and ref synchronously
    setHistory(prev => {
      const updatedHistory = {
        ...prev,
        currentIndex: newIndex
      };
      // Update ref immediately within the setter
      historyRef.current = updatedHistory;
      return updatedHistory;
    });
    
    return actionToRedo;
  }, []);

  const canUndo = history.currentIndex >= 0;
  const canRedo = history.currentIndex < history.items.length - 1;

  console.log('Action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'currentIndex:', history.currentIndex, 'totalItems:', history.items.length);

  const clearHistory = useCallback(() => {
    const clearedHistory = {
      items: [],
      currentIndex: -1,
      maxHistorySize
    };
    historyRef.current = clearedHistory;
    setHistory(clearedHistory);
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
