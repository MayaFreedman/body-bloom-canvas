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
        
        // Draw sidebar background - match real sidebar styling
        ctx.fillStyle = 'rgba(254, 254, 254, 0.95)'; // --cream with transparency
        ctx.fillRect(img.width, 0, sidebarWidth, img.height);
        
        // Draw sidebar border - grey like real sidebar
        ctx.strokeStyle = 'rgba(109, 106, 117, 0.3)'; // --warm-gray with transparency
        ctx.lineWidth = 1;
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

  // Helper function to get icon symbol for sensation
  const getIconSymbol = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      'butterfly': '🦋',
      'Zap': '⚡',
      'Wind': '💨', 
      'Droplet': '💧',
      'Snowflake': '❄️',
      'Thermometer': '🌡️',
      'Heart': '❤️',
      'Activity': '📊',
      'Star': '⭐',
      'Sparkles': '✨'
    };
    return iconMap[iconName] || '◆';
  };

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
    const itemHeight = 55; // Increased for larger text
    const sectionSpacing = 40;
    const sidebarX = mainImageWidth + padding;
    const headerHeight = 60;
    
    ctx.save();
    
    let currentY = 40;
    
    // Draw "Feeling Colours" section
    if (emotions.length > 0) {
      // Draw purple header background with subtle styling
      ctx.fillStyle = '#898AC4'; // --primary-purple
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.roundRect(sidebarX, currentY - 10, sidebarWidth - padding * 2, headerHeight, 8);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Draw header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Feeling Colours', sidebarX + (sidebarWidth - padding * 2) / 2, currentY + 25);
      ctx.textAlign = 'left';
      
      currentY += headerHeight + 25;
      
      emotions.forEach((item, index) => {
        const itemY = currentY + index * itemHeight;
        
        // Draw color circle - larger
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(sidebarX + 18, itemY, 14, 0, Math.PI * 2); // Increased size
        ctx.fill();
        
        // Add subtle border to color circle
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw emotion name - larger text
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '24px Arial, sans-serif'; // Increased from 20px
        ctx.fillText(item.name, sidebarX + 45, itemY + 8);
      });
      
      currentY += emotions.length * itemHeight + sectionSpacing;
    }
    
    // Draw "Body Sensations" section
    if (sensations.length > 0) {
      // Draw purple header background with subtle styling
      ctx.fillStyle = '#898AC4'; // --primary-purple
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.roundRect(sidebarX, currentY - 10, sidebarWidth - padding * 2, headerHeight, 8);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Draw header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Body Sensations', sidebarX + (sidebarWidth - padding * 2) / 2, currentY + 25);
      ctx.textAlign = 'left';
      
      currentY += headerHeight + 25;
      
      sensations.forEach((item, index) => {
        const itemY = currentY + index * itemHeight;
        
        // Draw icon background circle
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(sidebarX + 18, itemY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw specific icon symbol for this sensation
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        const iconSymbol = getIconSymbol(item.icon || '');
        ctx.fillText(iconSymbol, sidebarX + 18, itemY + 5);
        ctx.textAlign = 'left';
        
        // Draw sensation name - larger text
        ctx.fillStyle = '#2E315E'; // --deep-navy
        ctx.font = '24px Arial, sans-serif'; // Increased from 20px
        ctx.fillText(item.name, sidebarX + 45, itemY + 8);
      });
    }
    
    ctx.restore();
  };

  return {
    generateScreenshot
  };
};