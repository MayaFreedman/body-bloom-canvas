
import React, { useEffect } from 'react';
import { Room } from 'colyseus.js';
import { DrawingMark, SensationMark } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface MultiplayerMessageHandlerProps {
  room: Room | null;
  modelRef: React.RefObject<THREE.Group>;
  setDrawingMarks: (stroke: any) => void;
  setSensationMarks: React.Dispatch<React.SetStateAction<SensationMark[]>>;
  setBodyPartColors: (partName: string, color: string) => void;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  clearAll: () => void;
  controlsRef: React.RefObject<any>;
  onIncomingOptimizedStroke?: (stroke: OptimizedDrawingStroke) => void;
}

export const MultiplayerMessageHandler = ({
  room,
  modelRef,
  setDrawingMarks,
  setSensationMarks,
  setBodyPartColors,
  setRotation,
  clearAll,
  controlsRef,
  onIncomingOptimizedStroke
}: MultiplayerMessageHandlerProps) => {
  useEffect(() => {
    if (!room) return;

    const handleBroadcast = (message: any) => {
      try {
        if (!message || !message.type) {
          return;
        }

        const messageData = message.data || message.action;
        if (!messageData) {
          return;
        }

        switch (message.type) {
          case 'modelRotation': {
            if (messageData.direction === 'left') {
              setRotation(prev => prev - Math.PI / 2);
            } else if (messageData.direction === 'right') {
              setRotation(prev => prev + Math.PI / 2);
            }
            break;
          }
          case 'emotionUpdate': {
            if (controlsRef.current && controlsRef.current.handleIncomingEmotionUpdate) {
              controlsRef.current.handleIncomingEmotionUpdate(messageData);
            }
            break;
          }
          case 'optimizedDrawingStroke': {
            const optimizedStroke = messageData as OptimizedDrawingStroke;
            console.log('🎨 Processing optimized drawing stroke:', optimizedStroke);
            
            if (!optimizedStroke || !optimizedStroke.keyPoints || !Array.isArray(optimizedStroke.keyPoints)) {
              console.warn('⚠️ Invalid optimized stroke data:', optimizedStroke);
              return;
            }
            
            if (onIncomingOptimizedStroke) {
              console.log('🔗 Calling onIncomingOptimizedStroke handler');
              onIncomingOptimizedStroke(optimizedStroke);
            } else {
              console.warn('⚠️ No onIncomingOptimizedStroke handler provided');
            }
            break;
          }
          case 'drawingStroke': {
            const stroke = messageData;
            
            if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
              return;
            }
            
            setDrawingMarks(stroke);
            break;
          }
          case 'sensationPlace': {
            const sensation = messageData;
            
            if (!sensation || !sensation.position || !sensation.id) {
              return;
            }
            
            try {
              const newSensationMark: SensationMark = {
                id: sensation.id,
                position: new THREE.Vector3(
                  sensation.position.x || 0, 
                  sensation.position.y || 0, 
                  sensation.position.z || 0
                ),
                icon: sensation.icon || 'Star',
                color: sensation.color || '#ff6b6b',
                size: sensation.size || 0.1
              };
              setSensationMarks(prev => [...prev, newSensationMark]);
            } catch (sensationError) {
              console.error('❌ Error processing sensation:', sensationError, sensation);
            }
            break;
          }
          case 'bodyPartFill': {
            const fill = messageData;
            
            if (!fill || !fill.partName || !fill.color) {
              return;
            }
            
            try {
              setBodyPartColors(fill.partName, fill.color);
            } catch (fillError) {
              console.error('❌ Error applying body part fill:', fillError, fill);
            }
            break;
          }
          case 'resetAll': {
            clearAll();
            break;
          }
        }
      } catch (error) {
        console.error('❌ Error processing broadcast message:', error, message);
      }
    };

    room.onMessage('broadcast', handleBroadcast);
    
    return () => {
      try {
        room?.onMessage('broadcast', () => {});
      } catch (error) {
        console.error('❌ Error cleaning up broadcast listener:', error);
      }
    };
  }, [room, setDrawingMarks, setSensationMarks, setBodyPartColors, setRotation, clearAll, modelRef, controlsRef, onIncomingOptimizedStroke]);

  return null;
};
