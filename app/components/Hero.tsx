'use client'

import { motion } from 'framer-motion'
import { Twitter, Cpu } from 'lucide-react'
import GrainEffect from './GrainEffect'
import { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'
import { GradientButton } from '@/components/ui/gradient-button'
import Image from 'next/image'
import Link from 'next/link'

interface VantaEffect {
  destroy: () => void
  setOptions: (options: Record<string, unknown>) => void
}

export default function Hero() {
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null)
  const vantaRef = useRef<HTMLDivElement>(null)
  
  // Remove colorShift state and animation interval
  const staticColors = useMemo(() => ({
    color1: 0x3b82f6, // Fixed blue
    color2: 0x00ffff  // Fixed cyan
  }), []);

  // Initialize Vanta effect with delay after component mount
  useEffect(() => {
    let mountedRef = true;
    
    const initVanta = () => {
      if (!mountedRef || vantaEffect || !vantaRef.current) return;
      
      try {
        // Force THREE to be available globally (Vanta might rely on this)
        if (typeof window !== 'undefined') {
          // Using a properly typed window augmentation
          (window as Window & { THREE?: typeof THREE }).THREE = THREE;
        }
        
        // Use fixed colors and reduced animation settings
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
          color1: staticColors.color1,
          color2: staticColors.color2,
          size: 1.20,
          speed: 1.50  // Reduced speed
        });
        
        // Store the effect instance
        setVantaEffect(effect);
      } catch (error) {
        console.error('Failed to initialize Vanta effect:', error);
        // Retry after a delay
        setTimeout(initVanta, 1000);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initVanta, 500);
    
    return () => {
      clearTimeout(timer);
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (error) {
          console.error('Error destroying Vanta effect:', error);
        }
      }
      if (mountedRef) {
        mountedRef = false;
      }
    };
  }, [vantaEffect, staticColors]);

  // Handle mouse move for parallax effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!vantaRef.current) return;

    // Removed unused variables causing lint errors
    // const { clientX, clientY } = event;
    // const { offsetWidth, offsetHeight } = vantaRef.current;

    // const xPercent = (clientX / offsetWidth - 0.5) * 2;
    // const yPercent = (clientY / offsetHeight - 0.5) * 2;

    // Apply a subtle parallax effect to the Vanta background (if controls are off)
    // This needs careful integration with Vanta's own mouse controls if enabled
    // For simplicity, we might disable Vanta mouse controls if applying manual parallax

    // Example: Adjust content based on mouse (optional)
    // const contentElement = document.getElementById('hero-content');
    // if (contentElement) {
    //   contentElement.style.transform = `translate(${xPercent * -5}px, ${yPercent * -5}px)`;
    // }
  };

  return (
    <section 
      ref={vantaRef}
      className="relative min-h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Fallback background in case Vanta fails */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-black z-0" />
      
      {/* Vanta container */}
      <div className="absolute inset-0 z-[1]" />
      
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

      <div id="hero-content" className="container mx-auto px-6 pt-32 text-center relative z-10">
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
          className="flex items-center justify-center mt-16 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <Link href="/explore" passHref>
            <GradientButton 
              className="font-mono"
            >
              <Cpu className="inline-block w-7 h-7 mr-3" />
              Explore Protocol
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 