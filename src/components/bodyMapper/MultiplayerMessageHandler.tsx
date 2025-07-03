
import React, { useEffect } from 'react';
import { Room } from 'colyseus.js';
import { DrawingMark, SensationMark } from '@/types/bodyMapperTypes';
import { WorldDrawingPoint } from '@/types/multiplayerTypes';
import * as THREE from 'three';

interface MultiplayerMessageHandlerProps {
  room: Room | null;
  modelRef: React.RefObject<THREE.Group>;
  setDrawingMarks: React.Dispatch<React.SetStateAction<DrawingMark[]>>;
  setSensationMarks: React.Dispatch<React.SetStateAction<SensationMark[]>>;
  setBodyPartColors: (partName: string, color: string) => void; // Changed to handler function
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  clearAll: () => void;
  controlsRef: React.RefObject<any>;
}

// Helper function to interpolate between two world positions with body part validation
const interpolateWorldPositions = (
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  startBodyPart: string,
  endBodyPart: string,
  steps: number = 10
): THREE.Vector3[] => {
  // Only interpolate if both points are on the same body part
  if (startBodyPart !== endBodyPart) {
    return [];
  }

  const positions: THREE.Vector3[] = [];
  for (let i = 1; i < steps; i++) { // Skip first and last points as they're already processed
    const t = i / steps;
    const interpolatedPosition = new THREE.Vector3().lerpVectors(start, end, t);
    positions.push(interpolatedPosition);
  }
  return positions;
};

export const MultiplayerMessageHandler = ({
  room,
  modelRef,
  setDrawingMarks,
  setSensationMarks,
  setBodyPartColors,
  setRotation,
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
          case 'drawingStroke': {
            const stroke = messageData;
            console.log('🎨 Processing world position drawing stroke:', stroke);
            
            if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
              console.warn('⚠️ Invalid stroke data:', stroke);
              return;
            }
            
            // Convert world positions to local positions and create all marks at once
            const modelGroup = modelRef.current;
            if (modelGroup) {
              const newMarks: DrawingMark[] = [];
              
              // Process points and create marks with interpolation
              for (let i = 0; i < stroke.points.length; i++) {
                const currentPoint: WorldDrawingPoint = stroke.points[i];
                const worldPos = new THREE.Vector3(
                  currentPoint.worldPosition.x,
                  currentPoint.worldPosition.y,
                  currentPoint.worldPosition.z
                );
                
                const localPos = new THREE.Vector3();
                modelGroup.worldToLocal(localPos.copy(worldPos));
                
                // Add the current point
                const mark: DrawingMark = {
                  id: currentPoint.id,
                  position: localPos,
                  color: currentPoint.color,
                  size: currentPoint.size
                };
                newMarks.push(mark);
                
                // Interpolate to the next point if it exists and is on the same body part
                if (i < stroke.points.length - 1) {
                  const nextPoint: WorldDrawingPoint = stroke.points[i + 1];
                  const nextWorldPos = new THREE.Vector3(
                    nextPoint.worldPosition.x,
                    nextPoint.worldPosition.y,
                    nextPoint.worldPosition.z
                  );
                  
                  // Only interpolate if both points are on the same body part
                  if (currentPoint.bodyPart === nextPoint.bodyPart) {
                    const distance = worldPos.distanceTo(nextWorldPos);
                    const steps = Math.max(1, Math.floor(distance * 50)); // Same interpolation density as local drawing
                    
                    if (steps > 1) {
                      const interpolatedPositions = interpolateWorldPositions(
                        worldPos, 
                        nextWorldPos, 
                        currentPoint.bodyPart,
                        nextPoint.bodyPart,
                        steps
                      );
                      
                      // Add interpolated marks
                      interpolatedPositions.forEach((interpolatedWorldPos, j) => {
                        const interpolatedLocalPos = new THREE.Vector3();
                        modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedWorldPos));
                        
                        const interpolatedMark: DrawingMark = {
                          id: `interpolated-${currentPoint.id}-${j}`,
                          position: interpolatedLocalPos,
                          color: currentPoint.color,
                          size: currentPoint.size
                        };
                        newMarks.push(interpolatedMark);
                      });
                    }
                  }
                }
              }
              
              // Batch update all marks at once to prevent glitches
              if (newMarks.length > 0) {
                setDrawingMarks(prev => [...prev, ...newMarks]);
                console.log(`✅ Added ${newMarks.length} drawing marks from stroke`);
              }
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
              // Use the handler function instead of direct state update
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
  }, [room, setDrawingMarks, setSensationMarks, setBodyPartColors, setRotation, clearAll, modelRef, controlsRef]);

  return null;
};
