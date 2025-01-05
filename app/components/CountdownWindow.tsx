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
    // Get current time
    const now = new Date()
    const startTime = new Date(now)
    
    // If it's past 23:00, start now
    if (now.getHours() >= 23) {
      startTime.setTime(now.getTime())
    } else {
      // Otherwise, wait for 23:00
      startTime.setHours(23, 0, 0, 0)
    }

    // Set end time to 1 hour and 20 minutes after start
    const endTime = new Date(startTime.getTime() + (80 * 60 * 1000)) // 80 minutes in milliseconds

    const updateProgress = () => {
      const currentTime = new Date()
      
      // If we haven't reached start time yet, progress is 0
      if (currentTime < startTime) {
        setProgress(0)
        return
      }

      // If we're past end time, progress is 100
      if (currentTime > endTime) {
        setProgress(100)
        return
      }

      const total = endTime.getTime() - startTime.getTime()
      const elapsed = currentTime.getTime() - startTime.getTime()
      const newProgress = Math.min(100, Math.max(0, (elapsed / total) * 100))
      
      console.log({
        now: currentTime.toLocaleTimeString(),
        start: startTime.toLocaleTimeString(),
        end: endTime.toLocaleTimeString(),
        progress: newProgress.toFixed(2)
      })
      
      setProgress(newProgress)

      // Change message every ~15% progress
      const messageIndex = Math.floor((newProgress / 100) * MESSAGES.length)
      setMessage(MESSAGES[Math.min(messageIndex, MESSAGES.length - 1)])
    }

    // Initial update
    updateProgress()

    // Update every second
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
      <div 
        className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
        style={{
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.05), 0 0 10px rgba(255, 255, 255, 0.025), inset 0 0 5px rgba(255, 255, 255, 0.025)'
        }}
      >
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