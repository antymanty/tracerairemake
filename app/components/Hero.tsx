'use client'

import { motion } from 'framer-motion'
import { Twitter, Cpu } from 'lucide-react'
import GrainEffect from './GrainEffect'
import ExploreModal from './ExploreModal'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'
import { GradientButton } from '@/components/ui/gradient-button'
import Image from 'next/image'

interface VantaEffect {
  destroy: () => void
  setOptions: (options: Record<string, unknown>) => void
}

export default function Hero() {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null)
  const vantaRef = useRef<HTMLDivElement>(null)
  const [colorShift, setColorShift] = useState(0)
  const [isReady, setIsReady] = useState(false)
  
  // Store previous colors to enable smoother transitions
  const prevColorsRef = useRef({
    color1: 0x3b82f6,
    color2: 0x00ffff
  });

  // Initialize Vanta effect with delay after component mount
  useEffect(() => {
    let mountedRef = true;
    
    const initVanta = () => {
      if (!mountedRef || vantaEffect || !vantaRef.current) return;
      
      try {
        // Force THREE to be available globally (Vanta might rely on this)
        if (typeof window !== 'undefined') {
          (window as any).THREE = THREE;
        }
        
        // Use fixed initial colors - no dynamic color generation at startup
        const effect = CELLS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color1: 0x3b82f6, // Original vibrant blue
          color2: 0x00ffff, // Original vibrant cyan
          size: 1.10,
          speed: 2.00  // Slightly reduce speed to avoid flickering
        });
        
        // Store the effect instance
        setVantaEffect(effect);
        
        // Wait a bit before starting any animations
        setTimeout(() => {
          setIsReady(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize Vanta effect:', error);
        // Retry after a delay
        setTimeout(initVanta, 1000);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initVanta, 500);
    
    return () => {
      mountedRef = false;
      clearTimeout(timer);
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (error) {
          console.error('Error destroying Vanta effect:', error);
        }
      }
    };
  }, []); // Only run on mount

  // Handle color shifting separately - with reduced frequency to prevent flashing
  useEffect(() => {
    if (!vantaEffect || !isReady) return;
    
    // Use a much longer interval to reduce flickering (200ms instead of 50ms)
    const interval = setInterval(() => {
      try {
        // Slow down the color shift speed significantly
        const newShift = (colorShift + 0.005) % 1; 
        setColorShift(newShift);
        
        // Use extremely subtle color shifts (only 15 degrees of hue shift)
        const hue1 = 210 + (Math.sin(newShift * Math.PI * 2) * 0.5 + 0.5) * 15; 
        const hue2 = 180 + (Math.cos((newShift + 0.25) * Math.PI * 2) * 0.5 + 0.5) * 15;
        
        // Convert HSL to RGB hex
        const color1 = hslToHex(hue1, 100, 70);
        const color2 = hslToHex(hue2, 100, 60);
        
        // Interpolate between current and new colors to reduce flashing
        const newColor1Value = parseInt(color1.substring(1), 16);
        const newColor2Value = parseInt(color2.substring(1), 16);
        
        // Only update if there's a sufficient difference to avoid unnecessary renders
        if (Math.abs(newColor1Value - prevColorsRef.current.color1) > 100 || 
            Math.abs(newColor2Value - prevColorsRef.current.color2) > 100) {
          
          // Store new values for next comparison
          prevColorsRef.current = {
            color1: newColor1Value,
            color2: newColor2Value
          };
          
          // Update the effect with new colors
          vantaEffect.setOptions({
            color1: newColor1Value,
            color2: newColor2Value
          });
        }
      } catch (error) {
        console.error('Error updating Vanta colors:', error);
        clearInterval(interval);
      }
    }, 200); // Much slower updates to prevent flashing (200ms)

    return () => clearInterval(interval);
  }, [vantaEffect, colorShift, isReady]);

  // Helper function to convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Fallback background in case Vanta fails */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-black z-0" />
      
      {/* Vanta container */}
      <div ref={vantaRef} className="absolute inset-0 z-[1]" />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-transparent z-[2]" />
      
      {/* Grain effect */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        <GrainEffect />
      </div>

      {/* Social Links in top right */}
      <motion.div 
        className="absolute top-6 right-6 flex items-center gap-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <a 
          href="https://x.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors"
        >
          <Twitter className="w-6 h-6" />
        </a>
        <a 
          href="https://pump.fun" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative w-6 h-6 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Image
            src="/pump.png"
            alt="Pump.fun"
            fill
            sizes="(max-width: 768px) 24px, 24px"
            className="object-contain"
          />
        </a>
      </motion.div>

      <div className="container mx-auto px-6 pt-32 text-center relative z-10">
        <motion.h1 
          className="text-8xl font-bold tracking-tight mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Kodai
        </motion.h1>
        <motion.p 
          className="max-w-3xl mx-auto text-lg leading-relaxed text-white/80 mb-12 font-light tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Pioneering the convergence of AI and cellular science to revolutionize human health.
          <span className="block mt-3 text-white/70">
            Our quantum-powered neural networks decode the language of cells, unlocking breakthrough therapies and advancing the frontiers of regenerative medicine.
          </span>
        </motion.p>

        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="relative pointer-events-auto">
            <GradientButton 
              onClick={() => setIsExploreOpen(true)}
              className="font-mono"
            >
              <Cpu className="inline-block w-7 h-7 mr-3" />
              Explore Protocol
            </GradientButton>
          </div>
        </motion.div>
      </div>

      <ExploreModal 
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
      />
    </section>
  )
} 