'use client'

import VantaBackground from './VantaBackground'
import GrainEffect from './GrainEffect'
import { motion } from 'framer-motion'
import { Twitter, ExternalLink } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black">
      <VantaBackground>
        <div className="container mx-auto px-6 py-16 text-center relative z-10">
          <motion.h1 
            className="text-7xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-color-3 via-color-4 to-color-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Tracer<span className="text-color-1">AI</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300/90 mb-12 font-light"
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
            <a 
              href="https://twitter.com/tracerai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all font-medium"
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </a>
            <a 
              href="https://pump.fun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              pump.fun
            </a>
          </motion.div>
        </div>
      </VantaBackground>
      <div className="z-20">
        <GrainEffect />
      </div>
    </section>
  )
} 