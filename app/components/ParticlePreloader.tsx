'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VantaBackground from './VantaBackground'
import GrainEffect from './GrainEffect'

interface ParticlePreloaderProps {
  onLoadingComplete: () => void
}

export default function ParticlePreloader({ onLoadingComplete }: ParticlePreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const duration = 5 // 5 seconds
    const interval = 50 // Update every 50ms
    const steps = duration * 1000 / interval
    const increment = 100 / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        clearInterval(timer)
        currentProgress = 100
        setIsComplete(true)
        setTimeout(onLoadingComplete, 1000) // Delay transition for animation
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  return (
    <>
      <AnimatePresence>
        {!isComplete && (
          <motion.div 
            className="fixed inset-0 z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <VantaBackground>
              <GrainEffect />
              {/* Centered Progress Bar with Glow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
                <motion.div
                  className="h-2 bg-black/50 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-white relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                    style={{
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {/* Animated overlay for subtle shine */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{
                        animation: 'shimmer 2s linear infinite',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </motion.div>
                </motion.div>
                
                {/* Progress text */}
                <motion.div
                  className="mt-6 text-center text-2xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>
            </VantaBackground>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Black overlay for transition */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            className="fixed inset-0 bg-black z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Add keyframes for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  )
} 