import { useCallback } from 'react';
import { DrawingMark, SensationMark } from '@/types/bodyMapperTypes';
import { TextMark } from '@/types/textTypes';
import { CustomSensation } from '@/types/customEffectTypes';

export interface StateSnapshot {
  timestamp: number;
  version: string;
  data: {
    drawingMarks: DrawingMark[];
    sensationMarks: SensationMark[];
    bodyPartColors: Record<string, string>;
    textMarks: TextMark[];
    whiteboardBackground: string;
    modelRotation: number;
    customEffects?: CustomSensation[];
  };
  playerId: string;
}

interface UseStateSnapshotProps {
  drawingMarks: DrawingMark[];
  sensationMarks: SensationMark[];
  bodyPartColors: Record<string, string>;
  textMarks: TextMark[];
  whiteboardBackground: string;
  rotation: number;
  setDrawingMarks: (marks: DrawingMark[]) => void;
  setSensationMarks: (marks: SensationMark[]) => void;
  setBodyPartColors: (colors: Record<string, string>) => void;
  setTextMarks: (marks: TextMark[]) => void;
  setWhiteboardBackground: (color: string) => void;
  setRotation: (rotation: number) => void;
  currentPlayerId: string | null;
}

export const useStateSnapshot = ({
  drawingMarks,
  sensationMarks,
  bodyPartColors,
  textMarks,
  whiteboardBackground,
  rotation,
  setDrawingMarks,
  setSensationMarks,
  setBodyPartColors,
  setTextMarks,
  setWhiteboardBackground,
  setRotation,
  currentPlayerId
}: UseStateSnapshotProps) => {

  const captureCurrentState = useCallback((): StateSnapshot => {
    const customEffects = localStorage.getItem('customSensations');
    
    console.log('📸 SNAPSHOT CAPTURE - checking current data sources:');
    console.log('  - drawingMarks from closure:', drawingMarks?.length || 0);
    console.log('  - sensationMarks from closure:', sensationMarks?.length || 0);
    console.log('  - bodyPartColors from closure:', Object.keys(bodyPartColors || {}).length);
    console.log('  - textMarks from closure:', textMarks?.length || 0);
    
    return {
      timestamp: Date.now(),
      version: '1.0.0',
      data: {
        drawingMarks: [...drawingMarks],
        sensationMarks: [...sensationMarks],
        bodyPartColors: { ...bodyPartColors },
        textMarks: [...textMarks],
        whiteboardBackground,
        modelRotation: rotation,
        customEffects: customEffects ? JSON.parse(customEffects) : []
      },
      playerId: currentPlayerId || 'unknown'
    };
  }, []); // REMOVE ALL DEPENDENCIES to force fresh access each time

  const restoreFromSnapshot = useCallback((snapshot: StateSnapshot) => {
    try {
      console.log('🔄 Restoring state from snapshot:', snapshot);
      
      const { data } = snapshot;
      
      // Restore all state components
      setDrawingMarks(data.drawingMarks || []);
      setSensationMarks(data.sensationMarks || []);
      setBodyPartColors(data.bodyPartColors || {});
      setTextMarks(data.textMarks || []);
      setWhiteboardBackground(data.whiteboardBackground || 'white');
      setRotation(data.modelRotation || 0);
      
      // Restore custom effects to localStorage if they exist
      if (data.customEffects && data.customEffects.length > 0) {
        localStorage.setItem('customSensations', JSON.stringify(data.customEffects));
      }
      
      console.log('✅ State successfully restored from snapshot');
    } catch (error) {
      console.error('❌ Error restoring state from snapshot:', error);
      throw error;
    }
  }, [setDrawingMarks, setSensationMarks, setBodyPartColors, setTextMarks, setWhiteboardBackground, setRotation]);

  const validateSnapshot = useCallback((snapshot: any): snapshot is StateSnapshot => {
    if (!snapshot || typeof snapshot !== 'object') return false;
    if (!snapshot.timestamp || !snapshot.version || !snapshot.data || !snapshot.playerId) return false;
    
    const { data } = snapshot;
    if (!data || typeof data !== 'object') return false;
    
    // Validate required data properties
    const requiredProps = ['drawingMarks', 'sensationMarks', 'bodyPartColors', 'textMarks', 'whiteboardBackground', 'modelRotation'];
    
    for (const prop of requiredProps) {
      if (!(prop in data)) {
        console.warn(`Missing required property in snapshot: ${prop}`);
        return false;
      }
    }
    
    return true;
  }, []);

  const mergeSnapshots = useCallback((current: StateSnapshot, incoming: StateSnapshot): StateSnapshot => {
    // Simple timestamp-based conflict resolution - newest wins
    if (incoming.timestamp > current.timestamp) {
      console.log('🔄 Incoming snapshot is newer, using it');
      return incoming;
    } else {
      console.log('🔄 Current snapshot is newer, keeping it');
      return current;
    }
  }, []);

  return {
    captureCurrentState,
    restoreFromSnapshot,
    validateSnapshot,
    mergeSnapshots
  };
};