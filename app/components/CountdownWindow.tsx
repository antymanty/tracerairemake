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

// Fixed start time: November 23, 2023 at 23:00 Oslo time (UTC+1)
const FIXED_START_TIME = new Date('2023-11-23T22:00:00.000Z') // 23:00 Oslo time in UTC

export default function CountdownWindow() {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState(MESSAGES[0])

  useEffect(() => {
    // Set end time to 1 hour and 20 minutes after start
    const endTime = new Date(FIXED_START_TIME.getTime() + (80 * 60 * 1000)) // 80 minutes in milliseconds

    const updateProgress = () => {
      const currentTime = new Date()
      const total = endTime.getTime() - FIXED_START_TIME.getTime()
      const elapsed = currentTime.getTime() - FIXED_START_TIME.getTime()
      const newProgress = Math.min(100, Math.max(0, (elapsed / total) * 100))
      
      // Calculate message index based on progress
      const messageIndex = Math.floor((Math.min(newProgress, 100) / 100) * (MESSAGES.length - 1))
      setMessage(MESSAGES[messageIndex])
      setProgress(newProgress)

      console.log({
        now: currentTime.toLocaleTimeString(),
        start: FIXED_START_TIME.toLocaleTimeString(),
        end: endTime.toLocaleTimeString(),
        progress: newProgress.toFixed(2)
      })
    }

    // Initial update
    updateProgress()

    // Update every second if not at 100%
    const interval = setInterval(() => {
      updateProgress()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="absolute w-[90%] md:w-[500px] max-w-[500px] z-20 px-4 md:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <div 
        className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6"
        style={{
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.05), 0 0 10px rgba(255, 255, 255, 0.025), inset 0 0 5px rgba(255, 255, 255, 0.025)'
        }}
      >
        <ButtonGrainEffect />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs md:text-sm text-white/70 font-mono">INITIALIZATION SEQUENCE</div>
            <div className="text-xs md:text-sm text-white/70 font-mono">{progress.toFixed(2)}%</div>
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
            className="text-xs md:text-sm text-white/50 font-mono text-center"
          >
            {message}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 