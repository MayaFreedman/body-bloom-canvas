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

// Helper function to interpolate between two world positions
const interpolateWorldPositions = (start: THREE.Vector3, end: THREE.Vector3, steps: number = 10): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
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
            
            // Convert surface coordinates back to world positions and interpolate
            const modelGroup = modelRef.current;
            if (modelGroup) {
              const worldPositions: { position: THREE.Vector3; surfacePoint: SurfaceDrawingPoint }[] = [];
              
              // First, convert all surface points to world positions
              stroke.points.forEach((surfacePoint: SurfaceDrawingPoint) => {
                try {
                  if (!surfacePoint.surfaceCoord) {
                    console.warn('⚠️ Invalid surface point data:', surfacePoint);
                    return;
                  }
                  
                  const mesh = findMeshByBodyPart(modelGroup, surfacePoint.surfaceCoord.bodyPart);
                  if (!mesh) {
                    console.warn('⚠️ Could not find mesh for body part:', surfacePoint.surfaceCoord.bodyPart);
                    return;
                  }
                  
                  const worldPos = surfaceCoordinatesToWorldPosition(surfacePoint.surfaceCoord, mesh);
                  if (!worldPos) {
                    console.warn('⚠️ Could not convert surface coordinates to world position');
                    return;
                  }
                  
                  worldPositions.push({ position: worldPos, surfacePoint });
                } catch (pointError) {
                  console.error('❌ Error processing surface point:', pointError, surfacePoint);
                }
              });
              
              // Now interpolate between consecutive world positions
              for (let i = 0; i < worldPositions.length; i++) {
                const current = worldPositions[i];
                const localPos = new THREE.Vector3();
                modelGroup.worldToLocal(localPos.copy(current.position));
                
                // Add the current point
                const mark = {
                  id: current.surfacePoint.id,
                  position: localPos,
                  color: current.surfacePoint.color,
                  size: current.surfacePoint.size
                };
                setDrawingMarks(prev => [...prev, mark]);
                
                // Interpolate to the next point if it exists and is on the same body part
                if (i < worldPositions.length - 1) {
                  const next = worldPositions[i + 1];
                  
                  // Only interpolate if both points are on the same body part
                  if (current.surfacePoint.surfaceCoord.bodyPart === next.surfacePoint.surfaceCoord.bodyPart) {
                    const distance = current.position.distanceTo(next.position);
                    const steps = Math.max(1, Math.floor(distance * 50)); // Same interpolation density as local drawing
                    
                    if (steps > 1) {
                      const interpolatedPositions = interpolateWorldPositions(current.position, next.position, steps);
                      
                      // Add interpolated marks (skip first and last as they're already added)
                      for (let j = 1; j < interpolatedPositions.length - 1; j++) {
                        const interpolatedLocalPos = new THREE.Vector3();
                        modelGroup.worldToLocal(interpolatedLocalPos.copy(interpolatedPositions[j]));
                        
                        const interpolatedMark = {
                          id: `interpolated-${current.surfacePoint.id}-${j}`,
                          position: interpolatedLocalPos,
                          color: current.surfacePoint.color,
                          size: current.surfacePoint.size
                        };
                        setDrawingMarks(prev => [...prev, interpolatedMark]);
                      }
                    }
                  }
                }
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
