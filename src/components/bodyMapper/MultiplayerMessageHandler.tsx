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
        console.log('📨 Received broadcast message:', message);
        
        if (!message || !message.type) {
          console.warn('⚠️ Invalid message format:', message);
          return;
        }

        const messageData = message.data || message.action;
        if (!messageData) {
          console.warn('⚠️ No data/action in message:', message);
          return;
        }

        switch (message.type) {
          case 'modelRotation': {
            console.log('🔄 Processing model rotation:', messageData);
            if (messageData.direction === 'left') {
              setRotation(prev => prev - Math.PI / 2);
            } else if (messageData.direction === 'right') {
              setRotation(prev => prev + Math.PI / 2);
            }
            break;
          }
          case 'emotionUpdate': {
            console.log('🎨 Processing emotion update:', messageData);
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
              onIncomingOptimizedStroke(optimizedStroke);
            }
            break;
          }
          case 'drawingStroke': {
            const stroke = messageData;
            console.log('🎨 Processing legacy drawing stroke via handler:', stroke);
            
            if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
              console.warn('⚠️ Invalid stroke data:', stroke);
              return;
            }
            
            setDrawingMarks(stroke);
            break;
          }
          case 'sensationPlace': {
            const sensation = messageData;
            console.log('✨ Processing sensation:', sensation);
            
            if (!sensation || !sensation.position || !sensation.id) {
              console.warn('⚠️ Invalid sensation data:', sensation);
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
            console.log('🎨 Processing body part fill:', fill);
            
            if (!fill || !fill.partName || !fill.color) {
              console.warn('⚠️ Invalid fill data:', fill);
              return;
            }
            
            try {
              setBodyPartColors(fill.partName, fill.color);
              console.log('✅ Successfully applied body part fill via handler:', fill.partName, fill.color);
            } catch (fillError) {
              console.error('❌ Error applying body part fill:', fillError, fill);
            }
            break;
          }
          case 'resetAll': {
            console.log('🔄 Processing reset all from another user');
            clearAll();
            break;
          }
          default:
            console.log('🤷 Unknown message type:', message.type);
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
