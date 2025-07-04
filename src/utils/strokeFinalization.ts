
import { StrokeKeyPoint, OptimizedDrawingStroke } from '@/types/multiplayerTypes';

export const finalizeStroke = (keyPoints: StrokeKeyPoint[], color: string, size: number): OptimizedDrawingStroke | null => {
  try {
    if (keyPoints.length === 0) {
      console.log('⚠️ No points to finalize stroke');
      return null;
    }

    if (!color || typeof color !== 'string') {
      console.warn('⚠️ Invalid color for stroke, using default');
      color = '#ff6b6b';
    }

    if (!size || typeof size !== 'number' || size <= 0) {
      console.warn('⚠️ Invalid size for stroke, using default');
      size = 3;
    }

    const keyPointsCopy = [...keyPoints];
    
    let totalLength = 0;
    for (let i = 1; i < keyPointsCopy.length; i++) {
      const prev = keyPointsCopy[i - 1];
      const curr = keyPointsCopy[i];
      const distance = Math.sqrt(
        Math.pow(curr.worldPosition.x - prev.worldPosition.x, 2) +
        Math.pow(curr.worldPosition.y - prev.worldPosition.y, 2) +
        Math.pow(curr.worldPosition.z - prev.worldPosition.z, 2)
      );
      totalLength += distance;
    }

    const stroke: OptimizedDrawingStroke = {
      id: `optimized-stroke-${Date.now()}-${Math.random()}`,
      keyPoints: keyPointsCopy,
      metadata: {
        color,
        size,
        startTime: keyPointsCopy[0].timestamp,
        endTime: keyPointsCopy[keyPointsCopy.length - 1].timestamp,
        totalLength
      },
      playerId: ''
    };

    console.log('✅ Finalized optimized stroke with complete metadata:', {
      keyPointsCount: keyPointsCopy.length,
      color: stroke.metadata.color,
      size: stroke.metadata.size,
      totalLength: stroke.metadata.totalLength
    });
    return stroke;
  } catch (error) {
    console.error('❌ Error finalizing stroke:', error);
    return null;
  }
};
