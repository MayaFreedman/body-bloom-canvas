import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

interface ScreenshotCaptureProps {
  screenshotRef?: React.MutableRefObject<(() => void) | null>;
}

export const ScreenshotCapture = ({ screenshotRef }: ScreenshotCaptureProps) => {
  const { gl, scene, camera } = useThree();

  const captureScreenshot = () => {
    console.log('📸 Screenshot: Starting capture process');
    
    try {
      // Force a fresh render before capturing - this is the key!
      console.log('📸 Screenshot: Forcing render before capture');
      gl.render(scene, camera);
      
      // Immediately capture after render
      const dataURL = gl.domElement.toDataURL('image/png');
      console.log('📸 Screenshot: DataURL length:', dataURL.length);
      console.log('📸 Screenshot: DataURL starts with:', dataURL.substring(0, 50));
      
      // Create download link
      const link = document.createElement('a');
      link.download = `emotional-body-map-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      link.click();
      
      console.log('📸 Screenshot: Download triggered successfully');
    } catch (error) {
      console.error('📸 Screenshot: Failed to capture screenshot:', error);
    }
  };

  // Expose screenshot function through ref
  useEffect(() => {
    console.log('📸 Screenshot: Setting up ref in ScreenshotCapture');
    if (screenshotRef) {
      screenshotRef.current = captureScreenshot;
      console.log('📸 Screenshot: Ref assigned successfully in ScreenshotCapture');
    }
  }, [screenshotRef]);

  return null; // This component doesn't render anything
};