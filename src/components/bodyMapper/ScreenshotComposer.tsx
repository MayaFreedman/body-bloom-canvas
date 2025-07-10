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
        // Separate emotions and sensations for sidebar calculation
        const emotions = legendItems.filter(item => item.type === 'emotion');
        const sensations = legendItems.filter(item => item.type === 'sensation');
        
        // Calculate sidebar width and total canvas dimensions
        const sidebarWidth = 400; // Fixed sidebar width
        const padding = 20;
        const itemHeight = 40;
        const sectionSpacing = 30;
        
        // Create composite canvas with sidebar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size - original width + sidebar width
        canvas.width = img.width + sidebarWidth;
        canvas.height = img.height;
        
        // Draw the original screenshot on the left
        ctx.drawImage(img, 0, 0);
        
        // Draw sidebar background
        ctx.fillStyle = 'rgba(254, 254, 254, 0.98)';
        ctx.fillRect(img.width, 0, sidebarWidth, img.height);
        
        // Draw sidebar border
        ctx.strokeStyle = '#B8C9B5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(img.width, 0);
        ctx.lineTo(img.width, img.height);
        ctx.stroke();
        
        // Add overlays to main image
        drawLogo(ctx, img.width, img.height);
        drawDate(ctx);
        drawSidebarLegend(ctx, legendItems, img.width, sidebarWidth, img.height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = webglDataUrl;
    });
  }, [screenshotCaptureRef, emotions, sensationMarks]);

  const drawLogo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw "Body Mapping by" text - normal size, positioned on main image
    ctx.save();
    ctx.fillStyle = '#6D6A75'; // --warm-gray
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Body Mapping by', 16, height - 50);
    
    // Draw "PlaySpace" text - normal size
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

  const drawSidebarLegend = (ctx: CanvasRenderingContext2D, legendItems: LegendItem[], mainImageWidth: number, sidebarWidth: number, height: number) => {
    console.log('🎨 Drawing sidebar legend with', legendItems.length, 'items:', legendItems);
    if (legendItems.length === 0) return;
    
    // Separate emotions and sensations
    const emotions = legendItems.filter(item => item.type === 'emotion');
    const sensations = legendItems.filter(item => item.type === 'sensation');
    
    const padding = 20;
    const itemHeight = 50; // Increased from 40
    const sectionSpacing = 40; // Increased spacing
    const sidebarX = mainImageWidth + padding;
    const headerHeight = 60; // Height for styled headers
    
    ctx.save();
    
    let currentY = 40; // Start position
    
    // Draw "Feeling Colours" section
    if (emotions.length > 0) {
      // Draw purple header background
      ctx.fillStyle = '#898AC4'; // --primary-purple
      ctx.roundRect(sidebarX, currentY - 10, sidebarWidth - padding * 2, headerHeight, 8);
      ctx.fill();
      
      // Draw header text
      ctx.fillStyle = '#FFFFFF'; // White text on purple background
      ctx.font = 'bold 24px Arial, sans-serif'; // Increased from 20px
      ctx.textAlign = 'center';
      ctx.fillText('Feeling Colours', sidebarX + (sidebarWidth - padding * 2) / 2, currentY + 25);
      ctx.textAlign = 'left';
      
      currentY += headerHeight + 20;
      
      emotions.forEach((item, index) => {
        const itemY = currentY + index * itemHeight;
        
        // Draw color circle - larger
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(sidebarX + 15, itemY, 12, 0, Math.PI * 2); // Increased from 8 to 12
        ctx.fill();
        
        // Draw emotion name - larger text
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '20px Arial, sans-serif'; // Increased from 16px
        ctx.fillText(item.name, sidebarX + 40, itemY + 7);
      });
      
      currentY += emotions.length * itemHeight + sectionSpacing;
    }
    
    // Draw "Body Sensations" section
    if (sensations.length > 0) {
      // Draw purple header background
      ctx.fillStyle = '#898AC4'; // --primary-purple
      ctx.roundRect(sidebarX, currentY - 10, sidebarWidth - padding * 2, headerHeight, 8);
      ctx.fill();
      
      // Draw header text
      ctx.fillStyle = '#FFFFFF'; // White text on purple background
      ctx.font = 'bold 24px Arial, sans-serif'; // Increased from 20px
      ctx.textAlign = 'center';
      ctx.fillText('Body Sensations', sidebarX + (sidebarWidth - padding * 2) / 2, currentY + 25);
      ctx.textAlign = 'left';
      
      currentY += headerHeight + 20;
      
      sensations.forEach((item, index) => {
        const itemY = currentY + index * itemHeight;
        
        // Draw icon placeholder - larger
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(sidebarX + 15, itemY, 10, 0, Math.PI * 2); // Increased from 6 to 10
        ctx.fill();
        
        // Draw icon symbol - larger
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial, sans-serif'; // Increased from 10px
        ctx.textAlign = 'center';
        ctx.fillText('◆', sidebarX + 15, itemY + 4);
        ctx.textAlign = 'left';
        
        // Draw sensation name - larger text
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '20px Arial, sans-serif'; // Increased from 16px
        ctx.fillText(item.name, sidebarX + 40, itemY + 7);
      });
    }
    
    ctx.restore();
  };

  return {
    generateScreenshot
  };
};