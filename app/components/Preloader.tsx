'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GrainEffect from './GrainEffect'

interface PreloaderProps {
  onLoadingComplete: () => void
}

export default function Preloader({ onLoadingComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const duration = 5000 // 5 seconds
    const interval = 10 // Update every 10ms
    const steps = duration / interval
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      setProgress(Math.min((currentStep / steps) * 100, 100))
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setTimeout(onLoadingComplete, 500)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Subtle gradient background animation */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional subtle waves */}
      {isClient && [...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.1) 0%, transparent 60%)',
            filter: 'blur(30px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 6,
            delay: i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative w-full max-w-md p-8">
        {/* Progress Bar Container */}
        <div className="h-1 bg-gray-800/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500/90 to-cyan-500/90"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Loading Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <div className="text-sm text-gray-400/90 font-mono">
            {Math.round(progress)}%
          </div>
        </motion.div>
      </div>

      <GrainEffect />

      <style jsx global>{`
        body {
          background: black;
        }
      `}</style>
    </div>
  )
} 