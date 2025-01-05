'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ButtonGrainEffect from './ButtonGrainEffect'

const MESSAGES = [
  "Initializing quantum entanglement...",
  "Synchronizing neural pathways...",
  "Decoding temporal anomalies...",
  "Calibrating dimensional vectors...",
  "Aligning parallel realities...",
  "Processing ethereal data streams...",
  "Harmonizing quantum fluctuations...",
]

export default function CountdownWindow() {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState(MESSAGES[0])

  useEffect(() => {
    // Set the start time to 22:45 UTC
    const startTime = new Date()
    startTime.setUTCHours(22, 45, 0, 0)
    
    // If current time is before start time, adjust to previous day
    if (new Date() > startTime) {
      startTime.setDate(startTime.getDate() - 1)
    }
    
    const endTime = new Date(startTime.getTime() + (6 * 60 * 60 * 1000)) // 6 hours later

    const updateProgress = () => {
      const now = new Date()
      const total = endTime.getTime() - startTime.getTime()
      const elapsed = now.getTime() - startTime.getTime()
      const newProgress = Math.min(100, Math.max(0, (elapsed / total) * 100))
      setProgress(newProgress)

      // Change message every ~15% progress
      const messageIndex = Math.floor((newProgress / 100) * MESSAGES.length)
      setMessage(MESSAGES[Math.min(messageIndex, MESSAGES.length - 1)])
    }

    updateProgress()
    const interval = setInterval(updateProgress, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="absolute w-[500px] z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <ButtonGrainEffect />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-white/70 font-mono">INITIALIZATION SEQUENCE</div>
            <div className="text-sm text-white/70 font-mono">{progress.toFixed(2)}%</div>
          </div>
          
          <div className="h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
              }}
            />
          </div>

          <motion.div
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-white/50 font-mono text-center"
          >
            {message}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 