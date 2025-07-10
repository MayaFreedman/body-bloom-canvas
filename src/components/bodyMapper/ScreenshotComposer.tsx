import React, { useCallback } from 'react';
import { ScreenshotCaptureHandle } from './ScreenshotCapture';
import { generateLegendData, LegendItem } from '@/utils/legendGenerator';
import { SensationMark } from '@/types/bodyMapperTypes';

interface CustomEmotion {
  color: string;
  name: string;
}

interface ScreenshotComposerProps {
  screenshotCaptureRef: React.RefObject<ScreenshotCaptureHandle>;
  emotions: CustomEmotion[];
  sensationMarks: SensationMark[];
}

export const ScreenshotComposer = ({
  screenshotCaptureRef,
  emotions,
  sensationMarks
}: ScreenshotComposerProps) => {
  
  const generateScreenshot = useCallback(async (): Promise<string> => {
    if (!screenshotCaptureRef.current) {
      throw new Error('Screenshot capture not available');
    }

    // Get the clean WebGL screenshot
    const webglDataUrl = screenshotCaptureRef.current.captureScreenshot();
    
    // Generate legend data
    const legendItems = generateLegendData(emotions, sensationMarks);
    console.log('📊 Legend items generated:', legendItems, 'from emotions:', emotions, 'sensations:', sensationMarks);
    
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
  }, [screenshotCaptureRef, emotions, sensationMarks]);

  const drawLogo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw "Body Mapping by" text - 3x scale
    ctx.save();
    ctx.fillStyle = '#6D6A75'; // --warm-gray
    ctx.font = '42px Arial, sans-serif'; // 14px * 3
    ctx.fillText('Body Mapping by', 48, height - 150); // 16 * 3, 50 * 3
    
    // Draw "PlaySpace" text - 3x scale
    ctx.fillStyle = '#2E315E'; // --deep-navy
    ctx.font = 'bold 48px Arial, sans-serif'; // 16px * 3
    ctx.fillText('PlaySpace', 48, height - 84); // 16 * 3, 28 * 3
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
    ctx.font = '42px Arial, sans-serif'; // 14px * 3
    ctx.fillText(dateString, 48, 90); // 16 * 3, 30 * 3
    ctx.restore();
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, legendItems: LegendItem[], width: number, height: number) => {
    console.log('🎨 Drawing legend with', legendItems.length, 'items:', legendItems);
    if (legendItems.length === 0) return;
    
    // Separate emotions and sensations
    const emotions = legendItems.filter(item => item.type === 'emotion');
    const sensations = legendItems.filter(item => item.type === 'sensation');
    
    const legendWidth = 750; // 250 * 3
    const itemHeight = 84; // 28 * 3
    const padding = 48; // 16 * 3
    const sectionSpacing = 60; // Space between sections
    
    // Calculate total height for both sections
    let totalHeight = padding * 2; // Top and bottom padding
    if (emotions.length > 0) {
      totalHeight += 72 + emotions.length * itemHeight + 30; // Title + items + spacing
    }
    if (sensations.length > 0) {
      totalHeight += 72 + sensations.length * itemHeight; // Title + items
    }
    if (emotions.length > 0 && sensations.length > 0) {
      totalHeight += sectionSpacing; // Space between sections
    }
    
    const legendX = width - legendWidth - 48; // 16 * 3
    const legendY = 180; // 60 * 3
    
    // Draw legend background
    ctx.save();
    ctx.fillStyle = 'rgba(254, 254, 254, 0.95)'; // --cream with transparency
    ctx.strokeStyle = '#B8C9B5'; // --sage-green
    ctx.lineWidth = 3; // 1 * 3
    ctx.roundRect(legendX, legendY, legendWidth, totalHeight, 24); // 8 * 3
    ctx.fill();
    ctx.stroke();
    
    let currentY = legendY + 72; // 24 * 3
    
    // Draw "Feeling Colours" section
    if (emotions.length > 0) {
      ctx.fillStyle = '#2E315E'; // --deep-navy
      ctx.font = 'bold 48px Arial, sans-serif'; // 16px * 3
      ctx.fillText('Feeling Colours', legendX + padding, currentY);
      currentY += 30; // Small spacing after title
      
      emotions.forEach((item, index) => {
        const itemY = currentY + 30 + index * itemHeight; // 10 * 3
        
        // Draw color circle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + padding + 24, itemY, 24, 0, Math.PI * 2); // 8 * 3, 8 * 3
        ctx.fill();
        
        // Draw emotion name
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '42px Arial, sans-serif'; // 14px * 3
        ctx.fillText(item.name, legendX + padding + 72, itemY + 15); // 24 * 3, 5 * 3
      });
      
      currentY += emotions.length * itemHeight + sectionSpacing;
    }
    
    // Draw "Body Sensations" section
    if (sensations.length > 0) {
      ctx.fillStyle = '#2E315E'; // --deep-navy
      ctx.font = 'bold 48px Arial, sans-serif'; // 16px * 3
      ctx.fillText('Body Sensations', legendX + padding, currentY);
      currentY += 30; // Small spacing after title
      
      sensations.forEach((item, index) => {
        const itemY = currentY + 30 + index * itemHeight; // 10 * 3
        
        // Draw icon placeholder (since we can't load images directly in canvas)
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(legendX + padding + 18, itemY, 18, 0, Math.PI * 2); // 6 * 3, 6 * 3
        ctx.fill();
        
        // Draw icon symbol
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Arial, sans-serif'; // 10px * 3
        ctx.fillText('◆', legendX + padding + 9, itemY + 9); // 3 * 3, 3 * 3
        
        // Draw sensation name
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '42px Arial, sans-serif'; // 14px * 3
        ctx.fillText(item.name, legendX + padding + 72, itemY + 15); // 24 * 3, 5 * 3
      });
    }
    
    ctx.restore();
  };

  return {
    generateScreenshot
  };
};