
import { useState, useCallback } from 'react';
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
    console.log('Adding action:', action, 'for user:', currentUserId);
    if (!currentUserId) {
      console.log('No currentUserId, skipping action');
      return;
    }

    setHistory(prev => {
      const newAction: ActionHistoryItem = {
        ...action,
        id: `action-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        userId: currentUserId
      };

      console.log('New action created:', newAction);

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

      console.log('Updated user history:', updatedUserHistory);

      newUserHistories.set(currentUserId, updatedUserHistory);

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('Undo called for user:', currentUserId);
    if (!currentUserId) return null;
    
    const userHistory = history.userHistories.get(currentUserId);
    console.log('User history:', userHistory);
    if (!userHistory || userHistory.currentIndex < 0) {
      console.log('Cannot undo - no history or at beginning');
      return null;
    }
    
    const actionToUndo = userHistory.items[userHistory.currentIndex];
    console.log('Action to undo:', actionToUndo);
    
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
    console.log('Redo called for user:', currentUserId);
    if (!currentUserId) return null;
    
    const userHistory = history.userHistories.get(currentUserId);
    console.log('User history:', userHistory);
    if (!userHistory || userHistory.currentIndex >= userHistory.items.length - 1) {
      console.log('Cannot redo - no history or at end');
      return null;
    }
    
    const newIndex = userHistory.currentIndex + 1;
    const actionToRedo = userHistory.items[newIndex];
    console.log('Action to redo:', actionToRedo);
    
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

  console.log('Action history state - canUndo:', canUndo, 'canRedo:', canRedo, 'currentUserId:', currentUserId);

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
