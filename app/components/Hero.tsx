'use client'

import ButtonGrainEffect from './ButtonGrainEffect'
import { motion } from 'framer-motion'
import { Twitter, ExternalLink, Cpu } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import WavyBackground from './WavyBackground'
import ExploreModal from './ExploreModal'
import { useState } from 'react'
import GrainEffect from './GrainEffect'

export default function Hero() {
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <WavyBackground />
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
            <RainbowButton onClick={() => window.open('https://x.com/tracerai_', '_blank')}>
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

        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="relative">
            <RainbowButton 
              onClick={() => setIsExploreOpen(true)}
              className="text-lg px-8 py-4"
            >
              <Cpu className="w-6 h-6 mr-3" />
              Explore Protocol
            </RainbowButton>
            <ButtonGrainEffect />
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