'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import gsap from 'gsap'

interface ParticlePreloaderProps {
  onLoadingComplete: () => void
}

export default function ParticlePreloader({ onLoadingComplete }: ParticlePreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const timeRef = useRef(0)

  // Simulate loading progress over 7 seconds
  useEffect(() => {
    const duration = 7 // 7 seconds
    const interval = 50 // Update every 50ms
    const steps = duration * 1000 / interval
    const increment = 100 / steps
    let currentProgress = 0

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= 100) {
        clearInterval(timer)
        currentProgress = 100
        setTimeout(onLoadingComplete, 200) // Small delay before transition
      }
      setProgress(currentProgress)
    }, interval)

    return () => clearInterval(timer)
  }, [onLoadingComplete])

  useEffect(() => {
    if (!containerRef.current) return

    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let renderer: THREE.WebGLRenderer
    let particles: THREE.Points
    let mouseX = 0, mouseY = 0
    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2

    const init = () => {
      camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000)
      camera.position.z = 1000

      scene = new THREE.Scene()

      // Create particle system
      const geometry = new THREE.BufferGeometry()
      const vertices = []
      const colors = []
      const numParticles = 15000
      const numRows = 100
      const numCols = numParticles / numRows

      // Create a grid of particles
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const x = (j - numCols/2) * 10
          const y = (i - numRows/2) * 10
          const z = 0
          vertices.push(x, y, z)

          // Add color gradient
          const color = new THREE.Color()
          color.setHSL(0.6 + Math.random() * 0.2, 0.75, 0.5 + Math.random() * 0.25)
          colors.push(color.r, color.g, color.b)
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      renderer = new THREE.WebGLRenderer({ alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)
      containerRef.current?.appendChild(renderer.domElement)

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('resize', onWindowResize)
    }

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) / 2
      mouseY = (event.clientY - windowHalfY) / 2
    }

    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2
      windowHalfY = window.innerHeight / 2
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const animate = () => {
      if (!particles) return
      
      timeRef.current += 0.01

      const positions = particles.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        
        // Create wave effect
        positions[i + 2] = Math.sin(x * 0.02 + timeRef.current) * 50 + 
                          Math.cos(y * 0.02 + timeRef.current) * 50
      }
      particles.geometry.attributes.position.needsUpdate = true

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      
      renderer.render(scene, camera)
    }

    init()
    gsap.ticker.add(animate)

    return () => {
      gsap.ticker.remove(animate)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onWindowResize)
      renderer?.dispose()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Centered Progress Bar with Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
        <motion.div
          className="h-2 bg-black/50 rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-purple-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
            style={{
              boxShadow: '0 0 20px rgba(167, 139, 250, 0.5), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
            }}
          >
            {/* Animated gradient overlay for iridescent effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'shimmer 2s linear infinite',
                backgroundSize: '200% 100%',
              }}
            />
          </motion.div>
        </motion.div>
        
        {/* Glowing percentage text */}
        <motion.div
          className="mt-6 text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textShadow: '0 0 10px rgba(167, 139, 250, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          {Math.round(progress)}%
        </motion.div>
      </div>

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