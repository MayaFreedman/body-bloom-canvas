import React, { useEffect, useRef } from 'react';
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
  onIncomingUndo?: () => void;
  onIncomingRedo?: () => void;
  onIncomingErase?: (center: THREE.Vector3, radius: number, surface?: 'body' | 'whiteboard') => void;
  onIncomingSensation?: (sensationMark: SensationMark) => void;
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
  onIncomingOptimizedStroke,
  onIncomingUndo,
  onIncomingRedo,
  onIncomingErase,
  onIncomingSensation
}: MultiplayerMessageHandlerProps) => {
  // Store the unsubscribe function returned by onMessage
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    if (!room) return;

    console.log('🔧 Setting up multiplayer message handler for room');

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
          case 'eraseAction': {
            console.log('🧹 Processing incoming erase action with surface:', messageData.surface);
            if (onIncomingErase && messageData.center && messageData.radius) {
              const center = new THREE.Vector3(
                messageData.center.x,
                messageData.center.y,
                messageData.center.z
              );
              const surface = messageData.surface || 'body'; // Default to body for backward compatibility
              onIncomingErase(center, messageData.radius, surface);
            }
            break;
          }
          case 'undoAction': {
            console.log('🔄 Processing incoming undo action');
            if (onIncomingUndo) {
              onIncomingUndo();
            }
            break;
          }
          case 'redoAction': {
            console.log('🔄 Processing incoming redo action');
            if (onIncomingRedo) {
              onIncomingRedo();
            }
            break;
          }
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
            console.log('✨ Processing sensation placement:', sensation);
            
            if (!sensation || !sensation.position || !sensation.id) {
              console.warn('⚠️ Invalid sensation data:', sensation);
              return;
            }
            
            try {
              console.log('🔥 MULTIPLAYER: Received sensation data:', sensation);
              const newSensationMark: SensationMark = {
                id: sensation.id,
                position: new THREE.Vector3(
                  sensation.position.x || 0, 
                  sensation.position.y || 0, 
                  sensation.position.z || 0
                ),
                icon: sensation.icon || 'Star',
                color: sensation.color || '#ff6b6b',
                name: sensation.name || 'Unknown', // Include the name field for particle image determination
                size: sensation.size || 0.1,
                movementBehavior: sensation.movementBehavior || 'moderate', // Include movement behavior
                isCustom: sensation.isCustom || false // Include custom flag
              };
              console.log('🔥 MULTIPLAYER: Created sensation mark with icon:', newSensationMark.icon, 'full mark:', newSensationMark);
              console.log('✨ Adding sensation mark:', newSensationMark);
              
              // Use the new handler if available, otherwise fall back to direct state update
              if (onIncomingSensation) {
                onIncomingSensation(newSensationMark);
              } else {
                setSensationMarks(prev => [...prev, newSensationMark]);
              }
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

    // Store the unsubscribe function returned by onMessage
    unsubscribeRef.current = room.onMessage('broadcast', handleBroadcast);
    console.log('✅ Added broadcast listener to room');
    
    return () => {
      console.log('🧹 Cleaning up multiplayer message handler');
      
      // Call the unsubscribe function to remove the listener
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
          console.log('✅ Removed broadcast listener from room');
        } catch (error) {
          console.error('❌ Error removing broadcast listener:', error);
        }
      }
      
      // Clear the unsubscribe reference
      unsubscribeRef.current = null;
    };
  }, [room, setDrawingMarks, setSensationMarks, setBodyPartColors, setRotation, clearAll, modelRef, controlsRef, onIncomingOptimizedStroke, onIncomingUndo, onIncomingRedo, onIncomingErase, onIncomingSensation]);

  return null;
};
