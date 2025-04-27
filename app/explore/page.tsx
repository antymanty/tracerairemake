'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Info, ArrowLeft, Zap, BrainCircuit, ShieldCheck, Atom, Activity, Database, Network, Cpu,
  PauseCircle, PlayCircle, Thermometer, Target, AlertTriangle, ListChecks,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Tailwind Safelist (for dynamically generated classes - ideally in tailwind.config.ts)
/*
safelist: [
  'text-emerald-400', 'from-emerald-600', 'via-emerald-500', 'to-emerald-400', 'bg-emerald-400', 'border-emerald-400/30', 'bg-emerald-500/10',
  'text-cyan-400', 'from-cyan-600', 'via-cyan-500', 'to-cyan-400', 'bg-cyan-400', 'border-cyan-400/30', 'bg-cyan-500/10',
  'text-blue-400', 'from-blue-600', 'via-blue-500', 'to-blue-400', 'bg-blue-400', 'border-blue-400/30', 'bg-blue-500/10',
  'text-purple-400', 'from-purple-600', 'via-purple-500', 'to-purple-400', 'bg-purple-400', 'border-purple-400/30', 'bg-purple-500/10',
  'text-yellow-400', 'from-yellow-600', 'via-yellow-500', 'to-yellow-400', 'bg-yellow-400', 'border-yellow-400/30', 'bg-yellow-500/10',
  'text-pink-400', 'from-pink-600', 'via-pink-500', 'to-pink-400', 'bg-pink-400', 'border-pink-400/30', 'bg-pink-500/10',
  'text-green-400', 'from-green-600', 'via-green-500', 'to-green-400', 'bg-green-400', 'border-green-400/30', 'bg-green-500/10',
  'text-gray-400', 'border-gray-400/30', 'bg-gray-500/10',
]
*/

// Dynamically import the NeuralBackground with no SSR
const NeuralBackground = dynamic(() => import('../components/NeuralBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
})

// Data structure with enhanced metrics and descriptions
const protocolData = [
  { icon: Zap, title: 'Quantum-Assisted Gradient Descent', status: 'OPTIMIZING', value: '99.98%', displayValue: '99.98%', desc: 'Convergence Rate', color: 'emerald' },
  { icon: Cpu, title: 'Synaptic Throughput', status: 'ACTIVE', value: '92%', displayValue: '5.8 PetaFLOPS', desc: 'Processing Power', color: 'cyan' },
  { icon: Atom, title: 'Entanglement Fidelity', status: 'STABLE', value: '99.4%', displayValue: '99.4%', desc: 'Quantum Link Integrity', color: 'blue' },
  { icon: ShieldCheck, title: 'Ethical Oversight Matrix', status: 'ENFORCED', value: '100%', displayValue: '100%', desc: 'Compliance Score', color: 'purple' },
  { icon: BrainCircuit, title: 'Cognitive Simulation Engine', status: 'LEARNING', value: '95%', displayValue: '1.7T Params', desc: 'Active Parameters', color: 'yellow' },
  { icon: Database, title: 'Real-time Data Ingestion', status: 'STREAMING', value: '99%', displayValue: '15 TB/s', desc: 'Ingestion Rate', color: 'pink' },
  { icon: Network, title: 'Cross-Nodal Latency', status: 'LOW', value: '99.8%', displayValue: '< 2ms', desc: 'Network Efficiency', color: 'green' }
];

const architectureData = [
  { name: 'Quantum Core', value: '98%', icon: Atom, color: 'blue' },
  { name: 'Neural Engine', value: '95%', icon: BrainCircuit, color: 'cyan' },
  { name: 'Ethics Matrix', value: '100%', icon: ShieldCheck, color: 'purple' },
  { name: 'Predictive Unit', value: '97%', icon: Activity, color: 'emerald' },
  { name: 'Data Substrate', value: '99%', icon: Database, color: 'pink' },
  { name: 'Self-Healing Grid', value: '96%', icon: Zap, color: 'yellow' }
];

// Helper function for status colors
const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'OPTIMIZING': return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
    case 'ACTIVE':
    case 'STREAMING': return 'text-cyan-400 border-cyan-400/30 bg-cyan-500/10';
    case 'STABLE':
    case 'ENFORCED': return 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10';
    case 'LOW': return 'text-green-400 border-green-400/30 bg-green-500/10';
    case 'LEARNING': return 'text-purple-400 border-purple-400/30 bg-purple-500/10';
    default: return 'text-gray-400 border-gray-400/30 bg-gray-500/10';
  }
};

export default function ExplorePage() {
  const [showInfo, setShowInfo] = useState(true);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [currentLoss, setCurrentLoss] = useState(0.15 + Math.random() * 0.1);
  const [isPaused, setIsPaused] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Simulate log generation and loss update
  useEffect(() => {
    if (isPaused) return;

    const generateLog = () => {
      const epoch = Math.floor(1000 + Math.random() * 9000);
      const batch = Math.floor(Math.random() * 500);
      const loss = (0.005 + Math.random() * 0.05).toFixed(5);
      const actions = [
        `Epoch ${epoch}/10000 | Batch ${batch}/500 | Loss: ${loss}`,
        `[Quantum Core] Calibration cycle complete. Fidelity: 99.4${Math.floor(Math.random() * 9)}%`,
        `[Neural Engine] Synaptic adjustment applied. Throughput stable. `,
        `[Data Substrate] Ingesting stream: simulation_data_${Date.now()}.bin`,
        `[Ethics Matrix] Heuristic check passed. Confidence: ${(98 + Math.random() * 2).toFixed(2)}%`,
        `[Predictive Unit] Anomaly detected. Confidence: ${(Math.random() * 30).toFixed(2)}%. Monitoring...`,
        `[Self-Healing Grid] Minor node fluctuation corrected.`
      ];
      const newLog = actions[Math.floor(Math.random() * actions.length)];
      setLogEntries(prev => [`${new Date().toLocaleTimeString()} - ${newLog}`, ...prev.slice(0, 99)]); // Keep last 100 entries, add new at top
      
      // Simulate loss decreasing
      setCurrentLoss(prev => Math.max(0.001, prev * (0.99 + Math.random() * 0.005) - 0.0001));
    };

    const intervalId = setInterval(generateLog, 700 + Math.random() * 600); // Random interval

    return () => clearInterval(intervalId);
  }, [isPaused]);

  // Auto-scroll log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  // Mock Control Actions
  const handlePauseToggle = useCallback(() => {
    setIsPaused(prev => !prev);
    setLogEntries(prev => [`${new Date().toLocaleTimeString()} - [SYSTEM] Simulation ${isPaused ? 'Resumed' : 'Paused'}.`, ...prev.slice(0, 99)]);
  }, [isPaused]);

  const handleInjectData = useCallback(() => {
     setLogEntries(prev => [`${new Date().toLocaleTimeString()} - [SYSTEM] Injecting synthetic test dataset...`, ...prev.slice(0, 99)]);
    // Simulate a temporary spike in loss
    setCurrentLoss(prev => Math.min(0.5, prev + 0.1 + Math.random() * 0.1));
  }, []);

  const handleRecalibrate = useCallback(() => {
     setLogEntries(prev => [`${new Date().toLocaleTimeString()} - [SYSTEM] Initiating Quantum Core recalibration...`, ...prev.slice(0, 99)]);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black z-0">
        <NeuralBackground />
      </div>

      {/* --- Main Grid Layout --- */}
      {/* Simplified grid to 1 column as right panels are removed */}
      <div className="absolute inset-0 p-4 md:p-8 grid grid-cols-1 gap-4 md:gap-8 z-10 pointer-events-none">
        
        {/* Left Panel (Info + Status + Log) - Now takes full width */}
        <div className="md:col-span-1 pointer-events-auto h-full">
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="h-full flex flex-col"
              >
                {/* Container for Left Panel Content */}
                <div className="relative bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden shadow-2xl shadow-black/30 flex-grow flex flex-col">
                  {/* Header Gradient */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
                  
                  {/* Top Section: Title + Paragraph */}
                  <div className="relative p-4 md:p-6 flex-shrink-0 border-b border-white/10">
                    <motion.h1
                      className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent flex items-center gap-2"
                    >
                      <Zap size={20} className="text-cyan-400" /> TraceAI Protocol Status
                    </motion.h1>
                    <motion.p
                      className="text-white/70 text-xs md:text-sm"
                    >
                       Real-time monitoring of core functions.
                    </motion.p>
                  </div>

                  {/* Middle Section: Protocol Status List */}
                  <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar min-h-[30vh]">
                     {/* Status List rendering remains the same */} 
                     <motion.div 
                       initial="hidden"
                       animate="visible"
                       variants={{
                         visible: {
                           transition: { staggerChildren: 0.07, delayChildren: 0.1 } 
                         }
                       }}
                     > 
                      {protocolData.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div
                             key={item.title}
                             variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                             whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)', transition: { duration: 0.2 } }}
                             className="bg-black/40 rounded-md p-2.5 border border-white/10 hover:border-cyan-400/50 transition-colors duration-200 shadow-sm"
                           >
                              {/* ... (Content of status item) ... */}
                              <div className="flex justify-between items-center mb-1.5">
                                 <h3 className="text-white/90 font-medium text-xs flex items-center gap-1.5 truncate pr-1">
                                   <IconComponent size={14} className={`text-${item.color}-400 flex-shrink-0`} />
                                   <span className="truncate">{item.title}</span>
                                 </h3>
                                 <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(item.status)}`}>
                                   {item.status}
                                 </span>
                               </div>
                               <div className="w-full h-1.5 bg-gradient-to-r from-black/50 to-white/10 rounded-full mb-1 overflow-hidden relative">
                                  <motion.div /* ... Gradient bar ... */ 
                                   className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${item.color}-600 via-${item.color}-500 to-${item.color}-400 rounded-full`}
                                   style={{ width: item.value, transformOrigin: 'left' }}
                                   initial={{ scaleX: 0 }}
                                   animate={{ scaleX: 1 }}
                                   transition={{ delay: 0.2 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                                  />
                                   <motion.div /* ... Pulse ... */ 
                                    className={`absolute top-0 left-0 h-full bg-${item.color}-400 rounded-full`}
                                    style={{ width: item.value }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.5, 0] }}
                                    transition={{ delay: 0.5 + index * 0.05, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                                   />
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-white/60">{item.desc}</span>
                                  <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: 0.3 + index * 0.05}} 
                                    className="text-white/90 font-semibold"
                                   >
                                    {item.displayValue} 
                                  </motion.span>
                                </div>
                           </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Bottom Section: Training Log */}
                  <div className="flex-shrink-0 border-t border-white/10 overflow-hidden h-[25vh] flex flex-col">
                      <h3 className="text-white/90 font-semibold p-3 text-sm flex items-center gap-2 bg-black/20 flex-shrink-0 border-b border-white/10">
                          <ListChecks size={16} className="text-purple-400"/> Training Event Log 
                      </h3>
                      {/* Log container */} 
                      <div ref={logContainerRef} className="flex-grow overflow-y-auto p-3 space-y-1.5 flex flex-col-reverse custom-scrollbar bg-black/30">
                          {logEntries.map((entry, index) => (
                              <motion.p 
                                  key={logEntries.length - index}
                                  initial={{ opacity: 0, y: -10 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  transition={{ duration: 0.3 }}
                                  className="text-[11px] text-white/60 font-mono leading-snug"
                              >
                                 {entry}
                              </motion.p>
                          ))}
                      </div>
                      {/* Loss Display */} 
                      <div className="p-2 text-xs font-mono text-emerald-400 flex justify-between items-center bg-black/40 flex-shrink-0 border-t border-white/5">
                          <span>Current Loss:</span>
                          <motion.span 
                            key={currentLoss.toFixed(6)}
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.3}}
                          >
                             {currentLoss.toFixed(6)}
                          </motion.span>
                      </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panels Removed */}
        
      </div> 
      {/* End Main Grid */} 

      {/* Top Right Controls (Info/Back) - No Change */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-30 pointer-events-auto">
        <motion.button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 border border-white/10 shadow-lg"
          aria-label={showInfo ? "Hide Info Panel" : "Show Info Panel"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Info className="w-5 h-5" />
        </motion.button>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Link href="/" legacyBehavior>
            <a className="p-2 block rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 border border-white/10 shadow-lg"
               aria-label="Go Back">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Link>
        </motion.div>
      </div>

      {/* Footer Info - No Change */}
      <div className="absolute bottom-4 left-4 text-white/40 text-xs font-mono z-10 backdrop-blur-sm bg-black/20 px-2 py-1 rounded pointer-events-none">
        Click & drag to rotate • Scroll to zoom
      </div>
      <div className="absolute bottom-4 right-4 text-white/40 text-xs font-mono z-10 backdrop-blur-sm bg-black/20 px-2 py-1 rounded pointer-events-none">
        TraceAI v1.2.0-dev • Simulating...
      </div>

      {/* Custom Scrollbar CSS - No Change */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.4); /* Cyan on hover */
        }
      `}</style>
    </div>
  )
}