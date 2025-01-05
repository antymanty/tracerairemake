'use client'

import GrainEffect from './GrainEffect'
import ButtonGrainEffect from './ButtonGrainEffect'
import { motion } from 'framer-motion'
import { Twitter, ExternalLink } from 'lucide-react'
import { RainbowButton } from '@/components/ui/rainbow-button'
import WavyBackground from './WavyBackground'
import CountdownWindow from './CountdownWindow'

export default function Hero() {
  return (
    <motion.section 
      className="relative min-h-screen bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
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
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative">
            <RainbowButton onClick={() => window.open('https://x.com/Tracer AI_', '_blank')}>
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
      <div className="flex items-center justify-center absolute inset-0">
        <CountdownWindow />
      </div>
    </motion.section>
  )
} 