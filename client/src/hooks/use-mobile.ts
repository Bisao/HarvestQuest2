import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile
 * Based on screen width and touch capabilities
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check screen width
      const screenWidth = window.innerWidth;
      const isMobileWidth = screenWidth < 768;
      
      // Check if device supports touch
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider mobile if either small screen OR touch device with medium screen
      const shouldBeMobile = isMobileWidth || (isTouchDevice && screenWidth < 1024);
      
      setIsMobile(shouldBeMobile);
    };

    // Check on mount
    checkIsMobile();

    // Listen for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', () => {
      // Small delay to get accurate dimensions after orientation change
      setTimeout(checkIsMobile, 100);
    });

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  return isMobile;
}

/**
 * Hook to get current screen breakpoint
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}