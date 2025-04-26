'use client'

import ButtonGrainEffect from './ButtonGrainEffect'
import { motion } from 'framer-motion'
import { Twitter, ExternalLink, Cpu } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import GrainEffect from './GrainEffect'
import ExploreModal from './ExploreModal'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'
import { StarBorder } from '@/components/ui/star-border'

export default function Hero() {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [vantaEffect, setVantaEffect] = useState<any>(null)
  const vantaRef = useRef<HTMLDivElement>(null)
  const [colorShift, setColorShift] = useState(0)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      // Lighter, cell-themed blue colors
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
          color1: 0x60a5fa, // lighter blue
          color2: 0x34d399, // teal/mint green for cellular feel
          size: 1.10,
          speed: 2.50 // faster animation speed
        })
      )
    }
    
    // Create color shifting effect within a cell-appropriate palette
    const interval = setInterval(() => {
      if (vantaEffect) {
        const newShift = (colorShift + 0.015) % 1 // faster color transition
        setColorShift(newShift)
        
        // Use multiple sine waves for more complex effect
        // Adjusted to lighter blue/teal/aqua spectrum for cellular look
        const hue1 = 180 + (Math.sin(newShift * Math.PI * 2) * 0.5 + 0.5) * 40 // 180-220 (aqua to light blue)
        const hue2 = 150 + (Math.sin((newShift + 0.25) * Math.PI * 2) * 0.5 + 0.5) * 30 // 150-180 (teal to aqua)
        
        // Higher brightness for a lighter look
        const color1 = hslToHex(hue1, 90, 75)
        const color2 = hslToHex(hue2, 90, 70)
        
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
          className="text-7xl font-bold tracking-tighter mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Tracer<span className="text-white">AI</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-white/90 mb-12 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Empowering the future with intelligent tracking solutions
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative">
            <RainbowButton onClick={() => window.open('https://x.com/', '_blank')}>
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </RainbowButton>
            <ButtonGrainEffect />
          </div>
          <div className="relative">
            <RainbowButton onClick={() => window.open('https://pump.fun', '_blank')}>
              <ExternalLink className="w-5 h-5 mr-2" />
              pump.fun
            </RainbowButton>
            <ButtonGrainEffect />
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
          <StarBorder 
            onClick={() => setIsExploreOpen(true)}
            className="text-xl px-6 py-5 font-mono"
            color="#60a5fa" // Updated to match new color scheme
            speed="5s"
          >
            <Cpu className="inline-block w-7 h-7 mr-3" />
            Explore Protocol
          </StarBorder>
        </div>
      </motion.div>

      <ExploreModal 
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
      />
    </section>
  )
} 