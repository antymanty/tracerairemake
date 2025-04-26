'use client'
import { useEffect, useState, memo } from "react";

// Use memoization to prevent unnecessary re-rendering
const GrainEffect = memo(function GrainEffect() {
  const [noiseUrl, setNoiseUrl] = useState<string>('');

  useEffect(() => {
    // Check if we already have a cached noise texture in the session
    const cachedNoise = sessionStorage.getItem('noise-texture');
    
    if (cachedNoise) {
      setNoiseUrl(cachedNoise);
      return;
    }
    
    // Generate the noise texture only once
    const generateNoise = () => {
      // Use a smaller canvas for better performance
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width = 64; // Reduced from 100
      const h = canvas.height = 64; // Reduced from 100
      
      if (!ctx) return '';

      const imageData = ctx.createImageData(w, h);
      const buffer32 = new Uint32Array(imageData.data.buffer);
      
      // Generate fewer noise pixels for better performance
      for (let i = 0; i < buffer32.length; i++) {
        // Less frequent noise (30% instead of 50%)
        if (Math.random() < 0.3) {
          buffer32[i] = 0xff000000;
        } else {
          buffer32[i] = 0xffffffff;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Use a lower quality setting for toDataURL
      return canvas.toDataURL('image/jpeg', 0.5);
    };

    // Generate the noise and cache it
    const noiseDataUrl = generateNoise();
    setNoiseUrl(noiseDataUrl);
    
    try {
      sessionStorage.setItem('noise-texture', noiseDataUrl);
    } catch (e) {
      console.warn('Failed to cache noise texture');
    }
  }, []);

  // Don't render anything if we don't have a noise URL yet
  if (!noiseUrl) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${noiseUrl})`,
          backgroundRepeat: 'repeat',
          opacity: 0.01, // Reduced opacity from 0.015
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
});

export default GrainEffect; 