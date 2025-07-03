
import { useState, useCallback, useRef } from 'react';
import { ActionHistory, ActionHistoryItem, DrawingMark, DrawingStroke } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
}

export const useActionHistory = ({ maxHistorySize = 50 }: UseActionHistoryProps = {}) => {
  const [history, setHistory] = useState<ActionHistory>({
    items: [],
    currentIndex: -1,
    maxHistorySize
  });

  const addAction = useCallback((action: Omit<ActionHistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => {
      const newAction: ActionHistoryItem = {
        ...action,
        id: `action-${Date.now()}-${Math.random()}`,
        timestamp: Date.now()
      };

      // Remove any items after current index (when undoing then doing new action)
      const newItems = prev.items.slice(0, prev.currentIndex + 1);
      newItems.push(newAction);

      // Trim history if it exceeds max size
      if (newItems.length > maxHistorySize) {
        newItems.shift();
      }

      return {
        ...prev,
        items: newItems,
        currentIndex: newItems.length - 1
      };
    });
  }, [maxHistorySize]);

  const undo = useCallback((): ActionHistoryItem | null => {
    if (history.currentIndex <= 0) return null;
    
    const actionToUndo = history.items[history.currentIndex];
    setHistory(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1
    }));
    
    return actionToUndo;
  }, [history.currentIndex, history.items]);

  const redo = useCallback((): ActionHistoryItem | null => {
    if (history.currentIndex >= history.items.length - 1) return null;
    
    const newIndex = history.currentIndex + 1;
    const actionToRedo = history.items[newIndex];
    setHistory(prev => ({
      ...prev,
      currentIndex: newIndex
    }));
    
    return actionToRedo;
  }, [history.currentIndex, history.items]);

  const canUndo = history.currentIndex >= 0;
  const canRedo = history.currentIndex < history.items.length - 1;

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
