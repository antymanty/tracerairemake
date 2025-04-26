'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GrainEffect from './GrainEffect'

interface CellsLoaderProps {
  onLoadingComplete: () => void
}

// Memoize the component to prevent unnecessary re-renders
export default memo(function CellsLoader({ onLoadingComplete }: CellsLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

  // Check if THREE.js and Vanta resources are available
  useEffect(() => {
    // Skip resource preloading - we'll load on demand instead
    setResourcesLoaded(true);
  }, []);
  
  // Handle the progress bar animation - optimized
  useEffect(() => {
    // Don't start loading progress until resources check is done
    if (!resourcesLoaded) return;
    
    const duration = 2.5 // Reduced from 3 seconds to 2.5
    const interval = 100 // Less frequent updates (from 50ms to 100ms)
    const steps = duration * 1000 / interval
    const increment = 100 / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        clearInterval(timer)
        currentProgress = 100
        setIsComplete(true)
        // Shorter delay for transition
        setTimeout(() => {
          onLoadingComplete()
        }, 500) // Reduced from 800ms
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete, resourcesLoaded])

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
            {/* Grain effect is expensive, use with reduced intensity */}
            <div className="absolute inset-0 z-0 opacity-50">
              <GrainEffect />
            </div>
            
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