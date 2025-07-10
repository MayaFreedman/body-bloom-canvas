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
    if (legendItems.length === 0) return;
    
    const legendWidth = 250;
    const itemHeight = 28;
    const padding = 16;
    const legendHeight = legendItems.length * itemHeight + padding * 2;
    
    const legendX = width - legendWidth - 16;
    const legendY = 60; // Start below the date
    
    // Draw legend background
    ctx.save();
    ctx.fillStyle = 'rgba(254, 254, 254, 0.95)'; // --cream with transparency
    ctx.strokeStyle = '#B8C9B5'; // --sage-green
    ctx.lineWidth = 1;
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Draw legend title
    ctx.fillStyle = '#2E315E'; // --deep-navy
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('Legend', legendX + padding, legendY + 24);
    
    // Draw legend items
    legendItems.forEach((item, index) => {
      const itemY = legendY + 40 + index * itemHeight;
      
      // Draw color swatch or icon indicator
      ctx.fillStyle = item.color;
      if (item.type === 'emotion') {
        // Draw color circle for emotions
        ctx.beginPath();
        ctx.arc(legendX + padding + 8, itemY, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw smaller circle for sensations
        ctx.beginPath();
        ctx.arc(legendX + padding + 8, itemY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw small icon indicator
        ctx.fillStyle = '#2E315E';
        ctx.font = '10px Arial, sans-serif';
        ctx.fillText('◆', legendX + padding + 5, itemY + 3);
      }
      
      // Draw item name
      ctx.fillStyle = '#2E315E'; // --deep-navy
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(item.name, legendX + padding + 24, itemY + 5);
    });
    
    ctx.restore();
  };

  return {
    generateScreenshot
  };
};