'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Info, ArrowLeft } from 'lucide-react' // Changed X to ArrowLeft
import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link' // Added Link for navigation

// Dynamically import the NeuralBackground with no SSR
// Updated path from ./NeuralBackground to ../components/NeuralBackground
const NeuralBackground = dynamic(() => import('../components/NeuralBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

// Changed from memo(function ExploreModal...) to a standard function component
export default function ExplorePage() {
  const [showInfo, setShowInfo] = useState(true) // Show info by default on page load

  return (
    // Removed motion.div wrapper and fixed positioning
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-black">
        <NeuralBackground />
      </div>

      {/* Info Panel - Adjusted positioning */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            // Adjusted positioning for page context
            className="absolute left-4 top-20 md:left-8 md:top-24 w-[90%] max-w-[450px] z-10"
          >
            <div className="relative bg-black/50 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden shadow-xl">
              {/* Use simpler gradient approach */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 opacity-50" />

              {/* Content */}
              <div className="relative p-6 md:p-8">
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
                  className="text-white/70 mb-6 text-sm" // Reduced margin bottom
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Advanced artificial intelligence system utilizing quantum computing and neural
                  networks to revolutionize data processing and analysis.
                </motion.p>

                <div className="space-y-3"> {/* Reduced spacing */}
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
                    ].map((item) => (
                      <div
                        key={item.title}
                        // Slightly adjusted styling for the list items
                        className="bg-black/30 rounded-md p-3 border border-white/5 mb-3"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="text-white/90 font-medium text-sm">{item.title}</h3>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            item.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-400' :
                            item.status === 'SYNCED' ? 'bg-blue-500/20 text-blue-400' :
                            item.status === 'ENFORCED' ? 'bg-purple-500/20 text-purple-400' :
                             'bg-yellow-500/20 text-yellow-400' // LEARNING or other
                          }`}>{item.status}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mb-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            style={{ width: item.value }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">{item.desc}</span>
                          <span className="text-white/90 font-medium">{item.displayValue}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Simplified System Architecture display */}
                <motion.div
                  className="mt-6 space-y-3" // Reduced margin top and spacing
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-white/90 font-medium mb-2 text-sm">SYSTEM ARCHITECTURE</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Quantum Core', value: '98%' },
                      { name: 'Neural Engine', value: '95%' },
                      { name: 'Ethics Module', value: '100%' }
                    ].map((module) => (
                      <div key={module.name} className="space-y-1.5 text-center bg-black/30 p-2 rounded-md border border-white/5">
                         <div className="text-xs text-white/80">{module.name}</div>
                        <div className="h-1.5 bg-white/10 rounded overflow-hidden mx-auto w-full">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            style={{ width: module.value }}
                          />
                        </div>
                         <div className="text-xs font-semibold text-emerald-400">{module.value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls - Adjusted positioning and added back button */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        {/* Toggle Info Button */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
          aria-label={showInfo ? "Hide Info Panel" : "Show Info Panel"}
        >
          <Info className="w-5 h-5" />
        </button>
        {/* Back Button using Next Link */}
        <Link href="/" legacyBehavior>
          <a className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
             aria-label="Go Back">
            <ArrowLeft className="w-5 h-5" />
          </a>
        </Link>
      </div>

      {/* Footer Info - Adjusted positioning and styling */}
      <div className="absolute bottom-4 left-4 text-white/40 text-xs font-mono z-10">
        Click and drag to rotate • Scroll to zoom
      </div>
      <div className="absolute bottom-4 right-4 text-white/40 text-xs font-mono z-10">
        TraceAI v1.0.2-alpha • Build 20231214
      </div>
    </div>
  )
} 