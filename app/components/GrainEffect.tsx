'use client'
import { useEffect } from "react";

export default function GrainEffect() {
  useEffect(() => {
    const noise = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width = 100;
      const h = canvas.height = 100;
      
      if (!ctx) return '';

      const imageData = ctx.createImageData(w, h);
      const buffer32 = new Uint32Array(imageData.data.buffer);
      
      for (let i = 0; i < buffer32.length; i++) {
        if (Math.random() < 0.5) {
          buffer32[i] = 0xff000000;
        } else {
          buffer32[i] = 0xffffffff;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL();
    };

    document.documentElement.style.setProperty('--noise', `url(${noise()})`);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--noise)',
          backgroundRepeat: 'repeat',
          opacity: 0.015,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
} 