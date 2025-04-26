'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import FOG from 'vanta/dist/vanta.fog.min'
import GrainEffect from './GrainEffect'

interface CellsLoaderProps {
  onLoadingComplete: () => void
}

export default function CellsLoader({ onLoadingComplete }: CellsLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [vantaEffect, setVantaEffect] = useState<any>(null)
  const vantaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 100.00,
          minWidth: 100.00,
          highlightColor: 0x4c71f2, // bright blue
          midtoneColor: 0x3b82f6, // medium blue
          lowlightColor: 0x1d4ed8, // darker blue
          baseColor: 0x000000,
          blurFactor: 0.60,
          speed: 1.50,
          zoom: 0.75
        })
      )
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

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
        onLoadingComplete() // Remove delay for immediate transition
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  return (
    <div className="bg-black">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div ref={vantaRef} className="absolute inset-0 z-0">
              <GrainEffect />
            </div>
            
            {/* Centered Progress Bar with Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 z-10">
              <motion.div
                className="h-2 bg-black/50 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="h-full bg-blue-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                  style={{
                    boxShadow: '0 0 20px rgba(76, 113, 242, 0.6)',
                  }}
                >
                  {/* Animated overlay for subtle shine */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                    style={{
                      animation: 'shimmer 2s linear infinite',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </motion.div>
              </motion.div>
              
              {/* Progress text */}
              <motion.div
                className="mt-6 text-center text-2xl font-bold text-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textShadow: '0 0 10px rgba(76, 113, 242, 0.7), 0 0 20px rgba(76, 113, 242, 0.5)',
                }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
          </motion.div>
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
    </div>
  )
} 