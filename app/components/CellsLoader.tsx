'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GrainEffect from './GrainEffect'

interface CellsLoaderProps {
  onLoadingComplete: () => void
}

export default function CellsLoader({ onLoadingComplete }: CellsLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

  // Check if THREE.js and Vanta resources are available
  useEffect(() => {
    // Helper to check if script is loaded
    const isScriptLoaded = (src: string) => {
      return document.querySelector(`script[src*="${src}"]`) !== null;
    };

    // Function to pre-load required scripts
    const preloadResources = async () => {
      try {
        // Try to load THREE.js first if needed
        if (!isScriptLoaded('three')) {
          console.log('Preloading THREE.js');
          // This doesn't actually load the script, just checks if it would load
          await fetch('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', { method: 'HEAD' });
        }
        
        // Signal that resources are available
        setResourcesLoaded(true);
      } catch (error) {
        console.error('Error preloading resources:', error);
        // Continue anyway after a delay
        setTimeout(() => setResourcesLoaded(true), 1000);
      }
    };

    preloadResources();
  }, []);
  
  // Handle the progress bar animation
  useEffect(() => {
    // Don't start loading progress until resources check is done
    if (!resourcesLoaded) return;
    
    const duration = 3 // 3 seconds for loading animation
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
        // Add a longer delay for transition
        setTimeout(() => {
          onLoadingComplete()
        }, 800)
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete, resourcesLoaded])

  return (
    <div className="bg-black">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 z-0">
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
                  className="h-full bg-white relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                  style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
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
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5)',
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