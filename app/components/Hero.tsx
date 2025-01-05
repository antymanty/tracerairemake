'use client'

import VantaBackground from './VantaBackground'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <VantaBackground>
        <div className="container mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold text-white mb-4">
              Trace<span className="text-blue-400">AI</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Empowering the future with intelligent tracking solutions
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-white">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </VantaBackground>
    </section>
  )
} 