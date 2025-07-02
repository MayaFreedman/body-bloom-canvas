
import React, { useEffect } from 'react';
import { Room } from 'colyseus.js';
import { DrawingMark, SensationMark } from '@/types/bodyMapperTypes';
import { SurfaceDrawingPoint, findMeshByBodyPart, surfaceCoordinatesToWorldPosition } from '@/utils/surfaceCoordinates';
import * as THREE from 'three';

interface MultiplayerMessageHandlerProps {
  room: Room | null;
  modelRef: React.RefObject<THREE.Group>;
  setDrawingMarks: React.Dispatch<React.SetStateAction<DrawingMark[]>>;
  setSensationMarks: React.Dispatch<React.SetStateAction<SensationMark[]>>;
  setBodyPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clearAll: () => void;
  controlsRef: React.RefObject<any>;
}

export const MultiplayerMessageHandler = ({
  room,
  modelRef,
  setDrawingMarks,
  setSensationMarks,
  setBodyPartColors,
  clearAll,
  controlsRef
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
          case 'emotionUpdate': {
            console.log('🎨 Processing emotion update:', messageData);
            if (controlsRef.current && controlsRef.current.handleIncomingEmotionUpdate) {
              controlsRef.current.handleIncomingEmotionUpdate(messageData);
            }
            break;
          }
          case 'drawingStroke': {
            const stroke = messageData;
            console.log('🎨 Processing surface-based drawing stroke:', stroke);
            
            if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
              console.warn('⚠️ Invalid stroke data:', stroke);
              return;
            }
            
            // Convert surface coordinates back to world positions
            const modelGroup = modelRef.current;
            if (modelGroup) {
              stroke.points.forEach((surfacePoint: SurfaceDrawingPoint) => {
                try {
                  if (!surfacePoint.surfaceCoord) {
                    console.warn('⚠️ Invalid surface point data:', surfacePoint);
                    return;
                  }
                  
                  // Find the mesh for this body part
                  const mesh = findMeshByBodyPart(modelGroup, surfacePoint.surfaceCoord.bodyPart);
                  if (!mesh) {
                    console.warn('⚠️ Could not find mesh for body part:', surfacePoint.surfaceCoord.bodyPart);
                    return;
                  }
                  
                  // Convert surface coordinates to world position
                  const worldPos = surfaceCoordinatesToWorldPosition(surfacePoint.surfaceCoord, mesh);
                  if (!worldPos) {
                    console.warn('⚠️ Could not convert surface coordinates to world position');
                    return;
                  }
                  
                  // Convert to local position relative to the model
                  const localPos = new THREE.Vector3();
                  modelGroup.worldToLocal(localPos.copy(worldPos));
                  
                  const mark = {
                    id: surfacePoint.id,
                    position: localPos,
                    color: surfacePoint.color,
                    size: surfacePoint.size
                  };
                  setDrawingMarks(prev => [...prev, mark]);
                } catch (pointError) {
                  console.error('❌ Error processing surface point:', pointError, surfacePoint);
                }
              });
            }
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
              setBodyPartColors(prev => ({
                ...prev,
                [fill.partName]: fill.color
              }));
              console.log('✅ Successfully applied body part fill:', fill.partName, fill.color);
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
  }, [room, setDrawingMarks, setSensationMarks, setBodyPartColors, clearAll, modelRef, controlsRef]);

  return null;
};
