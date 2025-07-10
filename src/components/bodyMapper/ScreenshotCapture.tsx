import { useThree } from '@react-three/fiber';
import { useImperativeHandle, forwardRef } from 'react';

export interface ScreenshotCaptureHandle {
  captureScreenshot: () => string;
}

export const ScreenshotCapture = forwardRef<ScreenshotCaptureHandle>((_, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      // Force a fresh render right before capture
      gl.render(scene, camera);
      
      // Capture the screenshot
      return gl.domElement.toDataURL('image/png');
    }
  }), [gl, scene, camera]);

  return null;
});

ScreenshotCapture.displayName = 'ScreenshotCapture';