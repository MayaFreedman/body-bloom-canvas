import React, { useCallback } from 'react';
import { ScreenshotCaptureHandle } from './ScreenshotCapture';
import { generateLegendData, LegendItem } from '@/utils/legendGenerator';
import { SensationMark } from '@/types/bodyMapperTypes';

interface ScreenshotComposerProps {
  screenshotCaptureRef: React.RefObject<ScreenshotCaptureHandle>;
  bodyPartColors: Record<string, string>;
  sensationMarks: SensationMark[];
}

export const ScreenshotComposer = ({
  screenshotCaptureRef,
  bodyPartColors,
  sensationMarks
}: ScreenshotComposerProps) => {
  
  const generateScreenshot = useCallback(async (): Promise<string> => {
    if (!screenshotCaptureRef.current) {
      throw new Error('Screenshot capture not available');
    }

    // Get the clean WebGL screenshot
    const webglDataUrl = screenshotCaptureRef.current.captureScreenshot();
    
    // Generate legend data
    const legendItems = generateLegendData(bodyPartColors, sensationMarks);
    console.log('📊 Legend items generated:', legendItems, 'from colors:', bodyPartColors, 'sensations:', sensationMarks);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create composite canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size to match original
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original screenshot
        ctx.drawImage(img, 0, 0);
        
        // Add overlays
        drawLogo(ctx, canvas.width, canvas.height);
        drawDate(ctx);
        drawLegend(ctx, legendItems, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = webglDataUrl;
    });
  }, [screenshotCaptureRef, bodyPartColors, sensationMarks]);

  const drawLogo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw "Body Mapping by" text
    ctx.save();
    ctx.fillStyle = '#6D6A75'; // --warm-gray
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Body Mapping by', 16, height - 50);
    
    // Draw "PlaySpace" text (simplified since we can't load the image directly)
    ctx.fillStyle = '#2E315E'; // --deep-navy
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('PlaySpace', 16, height - 28);
    ctx.restore();
  };

  const drawDate = (ctx: CanvasRenderingContext2D) => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    ctx.save();
    ctx.fillStyle = '#2E315E'; // --deep-navy
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(dateString, 16, 30);
    ctx.restore();
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, legendItems: LegendItem[], width: number, height: number) => {
    console.log('🎨 Drawing legend with', legendItems.length, 'items:', legendItems);
    if (legendItems.length === 0) return;
    
    // Much larger and more visible legend
    const legendWidth = 320;
    const itemHeight = 40;
    const padding = 24;
    const legendHeight = legendItems.length * itemHeight + padding * 3;
    
    const legendX = width - legendWidth - 24;
    const legendY = 80; // Start below the date with more space
    
    // Draw legend background with shadow
    ctx.save();
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.roundRect(legendX + 4, legendY + 4, legendWidth, legendHeight, 12);
    ctx.fill();
    
    // Draw main background
    ctx.fillStyle = 'rgba(254, 254, 254, 0.98)'; // --cream with high opacity
    ctx.strokeStyle = '#B8C9B5'; // --sage-green
    ctx.lineWidth = 2;
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 12);
    ctx.fill();
    ctx.stroke();
    
    // Draw legend title
    ctx.fillStyle = '#2E315E'; // --deep-navy
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Legend', legendX + padding, legendY + 32);
    
    // Draw legend items
    legendItems.forEach((item, index) => {
      const itemY = legendY + 60 + index * itemHeight;
      
      // Draw color swatch or icon indicator
      ctx.fillStyle = item.color;
      if (item.type === 'emotion') {
        // Draw larger color circle for emotions
        ctx.beginPath();
        ctx.arc(legendX + padding + 12, itemY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#2E315E';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Draw icon background for sensations
        ctx.beginPath();
        ctx.arc(legendX + padding + 12, itemY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw small icon indicator
        ctx.fillStyle = '#FEFEFE';
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('◆', legendX + padding + 12, itemY + 4);
        ctx.textAlign = 'left'; // Reset alignment
      }
      
      // Draw item name with larger font
      ctx.fillStyle = '#2E315E'; // --deep-navy
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(item.name, legendX + padding + 36, itemY + 6);
    });
    
    ctx.restore();
  };

  return {
    generateScreenshot
  };
};