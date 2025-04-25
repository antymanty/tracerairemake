'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import GrainEffect from './GrainEffect'

interface SpinnerLoaderProps {
  onLoadingComplete: () => void
}

export default function SpinnerLoader({ onLoadingComplete }: SpinnerLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const duration = 5 // 5 seconds
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
        onLoadingComplete() // Remove delay for immediate transition
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  useEffect(() => {
    if (!mountRef.current) return
    
    // Set up scene
    const scene = new THREE.Scene()
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)
    
    // Create orbital rings
    const rings: THREE.Mesh[] = []
    const totalRings = 3
    
    for (let i = 0; i < totalRings; i++) {
      const geometry = new THREE.TorusGeometry(1 + i * 0.5, 0.05, 16, 100)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.7 - (i * 0.15)
      })
      const ring = new THREE.Mesh(geometry, material)
      scene.add(ring)
      rings.push(ring)
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      
      renderer.setSize(width, height)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      rings.forEach((ring, i) => {
        ring.rotation.x = Math.sin(Date.now() * 0.001 * (i + 1) * 0.3) * 0.5
        ring.rotation.y = Math.cos(Date.now() * 0.001 * (i + 1) * 0.2) * 0.5
        ring.rotation.z += 0.005 / (i + 1)
      })
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      rings.forEach(ring => {
        scene.remove(ring)
        ring.geometry.dispose()
        if (ring.material instanceof THREE.Material) {
          ring.material.dispose()
        } else if (Array.isArray(ring.material)) {
          ring.material.forEach(m => m.dispose())
        }
      })
    }
  }, [])

  return (
    <div className="bg-black">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div ref={mountRef} className="absolute inset-0"></div>
            <GrainEffect />
            
            {/* Centered Progress Bar with Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
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
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
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
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
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