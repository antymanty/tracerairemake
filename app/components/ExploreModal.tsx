'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Info } from 'lucide-react'
import NeuralBackground from './NeuralBackground'
import { useState } from 'react'

interface ExploreModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExploreModal({ isOpen, onClose }: ExploreModalProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black">
            <NeuralBackground />
          </div>
          
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-4 top-20 w-[400px] z-50"
              >
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 text-white font-mono">
                  <h1 className="text-2xl font-bold mb-4">TraceAI Protocol</h1>
                  <p className="text-white/70 mb-8 text-sm">
                    Advanced artificial intelligence system utilizing quantum computing and neural
                    networks to revolutionize data processing and analysis.
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3>Neural Network Optimization</h3>
                        <span className="text-emerald-400">ONLINE</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        Quantum-enhanced neural pathways operating at 99.98% efficiency
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3>Deep Learning Protocols</h3>
                        <span className="text-emerald-400">ACTIVE</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        Processing 1.2M parameters per millisecond
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3>Quantum Entanglement</h3>
                        <span className="text-emerald-400">SYNCED</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        Maintaining stable quantum state across all nodes
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3>AI Ethics Framework</h3>
                        <span className="text-emerald-400">ENFORCED</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        All operations within established ethical boundaries
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3>Autonomous Systems</h3>
                        <span className="text-emerald-400">LEARNING</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        Self-improvement protocols running at optimal capacity
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-4">SYSTEM ARCHITECTURE</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-emerald-400/30 rounded"></div>
                      <div className="h-2 bg-emerald-400/30 rounded"></div>
                      <div className="h-2 bg-emerald-400/30 rounded"></div>
                      <div className="text-center text-sm text-white/50">Quantum Core</div>
                      <div className="text-center text-sm text-white/50">Neural Engine</div>
                      <div className="text-center text-sm text-white/50">Ethics Module</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <Info className="w-6 h-6" />
            </button>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 text-white/50 text-sm font-mono">
            Click and drag to rotate • Scroll to zoom
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 