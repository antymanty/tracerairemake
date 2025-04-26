'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Info } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState, memo } from 'react'

// Dynamically import the NeuralBackground with no SSR
const NeuralBackground = dynamic(() => import('./NeuralBackground'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

interface ExploreModalProps {
  isOpen: boolean
  onClose: () => void
}

// Memoize component to avoid unnecessary re-renders
export default memo(function ExploreModal({ isOpen, onClose }: ExploreModalProps) {
  const [showInfo, setShowInfo] = useState(false)

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black">
        {/* Only render NeuralBackground when modal is open */}
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
            <div className="relative bg-black/40 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
              {/* Use simpler gradient approach */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10" />
              
              {/* Content */}
              <div className="relative p-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
                
                <motion.h1 
                  className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  TraceAI Protocol
                </motion.h1>
                
                <motion.p 
                  className="text-white/70 mb-8 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced artificial intelligence system utilizing quantum computing and neural
                  networks to revolutionize data processing and analysis.
                </motion.p>

                <div className="space-y-4">
                  {/* Batch these items to reduce animation complexity */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {[
                      { title: 'Neural Network Optimization', status: 'ONLINE', value: '99.98%', displayValue: '99.98%', desc: 'Quantum-enhanced neural pathways efficiency' },
                      { title: 'Deep Learning Protocols', status: 'ACTIVE', value: '92%', displayValue: '1.2M', desc: 'Parameters processed per millisecond' },
                      { title: 'Quantum Entanglement', status: 'SYNCED', value: '100%', displayValue: '100%', desc: 'Stable quantum state across nodes' },
                      { title: 'AI Ethics Framework', status: 'ENFORCED', value: '100%', displayValue: '100%', desc: 'Operations within ethical boundaries' },
                      { title: 'Autonomous Systems', status: 'LEARNING', value: '95%', displayValue: '95%', desc: 'Self-improvement protocol capacity' }
                    ].map((item, index) => (
                      <div
                        key={item.title}
                        className="bg-black/20 rounded-lg p-4 border border-white/5 mb-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white/90 font-medium">{item.title}</h3>
                          <span className="text-emerald-400 text-sm">{item.status}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            style={{ width: item.value }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">{item.desc}</span>
                          <span className="text-white/90">{item.displayValue}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                <motion.div 
                  className="mt-8 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-white/90 font-medium mb-4">SYSTEM ARCHITECTURE</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Quantum Core', value: '98%' },
                      { name: 'Neural Engine', value: '95%' },
                      { name: 'Ethics Module', value: '100%' }
                    ].map((module) => (
                      <div key={module.name} className="space-y-2">
                        <div className="h-2 bg-black/40 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            style={{ width: module.value }}
                          />
                        </div>
                        <div className="text-center text-sm">
                          <div className="text-white/90">{module.name}</div>
                          <div className="text-emerald-400">{module.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
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

      <div className="absolute bottom-6 right-6 text-white/50 text-sm font-mono">
        TraceAI v1.0.2-alpha • Build 20231214
      </div>
    </motion.div>
  )
}) 