'use client'

import ButtonGrainEffect from './ButtonGrainEffect'
import { motion } from 'framer-motion'
import { Twitter, ExternalLink, Cpu } from 'lucide-react'
import GrainEffect from './GrainEffect'
import ExploreModal from './ExploreModal'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'
import { StarBorder } from '@/components/ui/star-border'
import { GradientButton } from '@/components/ui/gradient-button'

export default function Hero() {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [vantaEffect, setVantaEffect] = useState<any>(null)
  const vantaRef = useRef<HTMLDivElement>(null)
  const [colorShift, setColorShift] = useState(0)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      // Blue color scheme instead of magenta/purple
      setVantaEffect(
        CELLS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color1: 0x3b82f6, // blue
          color2: 0x00ffff, // cyan
          size: 1.10,
          speed: 2.50 // faster animation speed
        })
      )
    }
    
    // Create ultra vibrant color shifting iridescent effect
    const interval = setInterval(() => {
      if (vantaEffect) {
        const newShift = (colorShift + 0.015) % 1 // faster color transition
        setColorShift(newShift)
        
        // Use multiple sine waves for more complex iridescent effect
        // Adjusted to blue spectrum (200-280 degrees in HSL)
        const hue1 = 200 + (Math.sin(newShift * Math.PI * 2) * 0.5 + 0.5) * 80
        const hue2 = 180 + (Math.sin((newShift + 0.25) * Math.PI * 2) * 0.5 + 0.5) * 60
        
        // Convert HSL to RGB hex with higher saturation (100%) and brightness (70%)
        const color1 = hslToHex(hue1, 100, 70)
        const color2 = hslToHex(hue2, 100, 60)
        
        vantaEffect.setOptions({
          color1: parseInt(color1.substring(1), 16),
          color2: parseInt(color2.substring(1), 16)
        })
      }
    }, 50) // Faster update (50ms instead of 100ms)

    return () => {
      if (vantaEffect) vantaEffect.destroy()
      clearInterval(interval)
    }
  }, [vantaEffect, colorShift])

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
      <div ref={vantaRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 pointer-events-none">
        <GrainEffect />
      </div>
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
          className="flex flex-col md:flex-row items-center justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative">
            <StarBorder 
              onClick={() => window.open('https://x.com/', '_blank')}
              className="text-base px-6 py-3 font-medium"
              color="#4c71f2"
              speed="5s"
            >
              <Twitter className="inline-block w-5 h-5 mr-2" />
              Twitter
            </StarBorder>
          </div>
          <div className="relative">
            <StarBorder 
              onClick={() => window.open('https://pump.fun', '_blank')}
              className="text-base px-6 py-3 font-medium"
              color="#4c71f2"
              speed="5s"
            >
              <ExternalLink className="inline-block w-5 h-5 mr-2" />
              pump.fun
            </StarBorder>
          </div>
        </motion.div>
      </div>

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

      <ExploreModal 
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
      />
    </section>
  )
} 