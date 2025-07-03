
import { useState, useCallback, useRef } from 'react';
import { ActionHistory, ActionHistoryItem, UserActionHistory } from '@/types/actionHistoryTypes';

interface UseActionHistoryProps {
  maxHistorySize?: number;
  currentUserId: string | null;
}

export const useActionHistory = ({ maxHistorySize = 50, currentUserId }: UseActionHistoryProps) => {
  const [history, setHistory] = useState<ActionHistory>({
    userHistories: new Map(),
    maxHistorySize
  });

  const addAction = useCallback((action: Omit<ActionHistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUserId) return;

    setHistory(prev => {
      const newAction: ActionHistoryItem = {
        ...action,
        id: `action-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        userId: currentUserId
      };

      const newUserHistories = new Map(prev.userHistories);
      const userHistory = newUserHistories.get(currentUserId) || {
        items: [],
        currentIndex: -1,
        maxHistorySize
      };

      // Remove any items after current index (when undoing then doing new action)
      const newItems = userHistory.items.slice(0, userHistory.currentIndex + 1);
      newItems.push(newAction);

      // Trim history if it exceeds max size
      if (newItems.length > maxHistorySize) {
        newItems.shift();
      }

      const updatedUserHistory: UserActionHistory = {
        ...userHistory,
        items: newItems,
        currentIndex: newItems.length - 1
      };

      newUserHistories.set(currentUserId, updatedUserHistory);

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    if (!currentUserId) return null;
    
    const userHistory = history.userHistories.get(currentUserId);
    if (!userHistory || userHistory.currentIndex < 0) return null;
    
    const actionToUndo = userHistory.items[userHistory.currentIndex];
    
    setHistory(prev => {
      const newUserHistories = new Map(prev.userHistories);
      const currentUserHistory = newUserHistories.get(currentUserId)!;
      
      newUserHistories.set(currentUserId, {
        ...currentUserHistory,
        currentIndex: currentUserHistory.currentIndex - 1
      });

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
    
    return actionToUndo;
  }, [history.userHistories, currentUserId]);

  const redo = useCallback((): ActionHistoryItem | null => {
    if (!currentUserId) return null;
    
    const userHistory = history.userHistories.get(currentUserId);
    if (!userHistory || userHistory.currentIndex >= userHistory.items.length - 1) return null;
    
    const newIndex = userHistory.currentIndex + 1;
    const actionToRedo = userHistory.items[newIndex];
    
    setHistory(prev => {
      const newUserHistories = new Map(prev.userHistories);
      const currentUserHistory = newUserHistories.get(currentUserId)!;
      
      newUserHistories.set(currentUserId, {
        ...currentUserHistory,
        currentIndex: newIndex
      });

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
    
    return actionToRedo;
  }, [history.userHistories, currentUserId]);

  const getCurrentUserHistory = useCallback(() => {
    if (!currentUserId) return null;
    return history.userHistories.get(currentUserId) || null;
  }, [history.userHistories, currentUserId]);

  const canUndo = currentUserId ? (getCurrentUserHistory()?.currentIndex || -1) >= 0 : false;
  const canRedo = currentUserId ? (getCurrentUserHistory()?.currentIndex || -1) < ((getCurrentUserHistory()?.items.length || 1) - 1) : false;

  const clearHistory = useCallback(() => {
    setHistory({
      userHistories: new Map(),
      maxHistorySize
    });
  }, [maxHistorySize]);

  const clearUserHistory = useCallback((userId: string) => {
    setHistory(prev => {
      const newUserHistories = new Map(prev.userHistories);
      newUserHistories.delete(userId);
      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
  }, []);

  return {
    history,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    clearUserHistory,
    getCurrentUserHistory
  };
};
