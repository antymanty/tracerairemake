'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CellsLoaderProps {
  onLoadingComplete: () => void
}

// Memoize the component to prevent unnecessary re-renders
export default memo(function CellsLoader({ onLoadingComplete }: CellsLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Handle the progress bar animation
  useEffect(() => {
    // Start loading immediately
    const duration = 2.5 
    const interval = 100 
    const steps = duration * 1000 / interval
    const increment = 100 / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        clearInterval(timer)
        currentProgress = 100
        setIsComplete(true)
        setTimeout(() => {
          onLoadingComplete()
        }, 500) 
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  // Use simpler animation for better performance
  return (
    <div className="bg-black">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Faster transition
          >
            {/* Centered Progress Bar with simplified glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 z-10">
              <motion.div
                className="h-2 bg-black/50 rounded-full overflow-hidden backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }} // Faster animation
              >
                <motion.div
                  className="h-full bg-white relative"
                  style={{ width: `${progress}%` }}
                />
              </motion.div>
              
              {/* Progress text - simplified */}
              <motion.div
                className="mt-4 text-center text-xl font-bold text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}) 