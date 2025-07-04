
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
    console.log('📝 Adding action:', action.type, 'for user:', currentUserId);
    if (!currentUserId) {
      console.log('⚠️ No currentUserId, skipping action');
      return;
    }

    setHistory(prev => {
      const newAction: ActionHistoryItem = {
        ...action,
        id: `action-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        userId: currentUserId
      };

      console.log('✅ New action created:', newAction.type, 'with id:', newAction.id);

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

      console.log('📊 Updated user history - items:', updatedUserHistory.items.length, 'currentIndex:', updatedUserHistory.currentIndex);

      newUserHistories.set(currentUserId, updatedUserHistory);

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
  }, [maxHistorySize, currentUserId]);

  const undo = useCallback((): ActionHistoryItem | null => {
    console.log('↩️ Undo called for user:', currentUserId);
    if (!currentUserId) {
      console.log('⚠️ No currentUserId for undo');
      return null;
    }
    
    const userHistory = history.userHistories.get(currentUserId);
    console.log('📚 User history:', userHistory ? `${userHistory.items.length} items, index ${userHistory.currentIndex}` : 'none');
    
    if (!userHistory || userHistory.currentIndex < 0) {
      console.log('❌ Cannot undo - no history or at beginning');
      return null;
    }
    
    const actionToUndo = userHistory.items[userHistory.currentIndex];
    console.log('↩️ Undoing action:', actionToUndo.type, 'with id:', actionToUndo.id);
    
    // Validate that the current index is within bounds
    if (userHistory.currentIndex >= userHistory.items.length) {
      console.error('❌ Invalid currentIndex state in undo:', userHistory.currentIndex, 'items:', userHistory.items.length);
      return null;
    }
    
    setHistory(prev => {
      const newUserHistories = new Map(prev.userHistories);
      const currentUserHistory = newUserHistories.get(currentUserId);
      
      if (!currentUserHistory) {
        console.error('❌ User history disappeared during undo');
        return prev;
      }
      
      const newIndex = currentUserHistory.currentIndex - 1;
      console.log('📊 Setting new currentIndex:', newIndex);
      
      newUserHistories.set(currentUserId, {
        ...currentUserHistory,
        currentIndex: newIndex
      });

      return {
        ...prev,
        userHistories: newUserHistories
      };
    });
    
    return actionToUndo;
  }, [history.userHistories, currentUserId]);

  const redo = useCallback((): ActionHistoryItem | null => {
    console.log('↪️ Redo called for user:', currentUserId);
    if (!currentUserId) {
      console.log('⚠️ No currentUserId for redo');
      return null;
    }
    
    const userHistory = history.userHistories.get(currentUserId);
    console.log('📚 User history:', userHistory ? `${userHistory.items.length} items, index ${userHistory.currentIndex}` : 'none');
    
    if (!userHistory || userHistory.currentIndex >= userHistory.items.length - 1) {
      console.log('❌ Cannot redo - no history or at end');
      return null;
    }
    
    const newIndex = userHistory.currentIndex + 1;
    
    // Validate that the new index is within bounds
    if (newIndex >= userHistory.items.length) {
      console.error('❌ Invalid newIndex state in redo:', newIndex, 'items:', userHistory.items.length);
      return null;
    }
    
    const actionToRedo = userHistory.items[newIndex];
    console.log('↪️ Redoing action:', actionToRedo.type, 'with id:', actionToRedo.id);
    
    setHistory(prev => {
      const newUserHistories = new Map(prev.userHistories);
      const currentUserHistory = newUserHistories.get(currentUserId);
      
      if (!currentUserHistory) {
        console.error('❌ User history disappeared during redo');
        return prev;
      }
      
      console.log('📊 Setting new currentIndex:', newIndex);
      
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

  console.log('🎛️ Action history state for user', currentUserId, '- canUndo:', canUndo, 'canRedo:', canRedo);

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
