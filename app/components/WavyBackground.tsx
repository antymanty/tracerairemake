'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

export default function WavyBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef(0)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Store a reference to the container element that's stable across cleanup
    const container = containerRef.current

    let mouseX = 0, mouseY = 0
    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2

    const init = () => {
      // Clean up any existing canvas first
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      cameraRef.current = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000)
      cameraRef.current.position.z = 1000

      sceneRef.current = new THREE.Scene()

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

      particlesRef.current = new THREE.Points(geometry, material)
      sceneRef.current.add(particlesRef.current)

      rendererRef.current = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
      })
      rendererRef.current.setPixelRatio(window.devicePixelRatio)
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      
      // Position the canvas absolutely within the container
      const canvas = rendererRef.current.domElement
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      
      container.appendChild(canvas)

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
      if (cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
      }
      rendererRef.current?.setSize(window.innerWidth, window.innerHeight)
    }

    const animate = () => {
      if (!particlesRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return
      
      timeRef.current += 0.01

      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        
        // Create wave effect
        positions[i + 2] = Math.sin(x * 0.02 + timeRef.current) * 50 + 
                          Math.cos(y * 0.02 + timeRef.current) * 50
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true

      cameraRef.current.position.x += (mouseX * 0.5 - cameraRef.current.position.x) * 0.05
      cameraRef.current.position.y += (-mouseY * 0.5 - cameraRef.current.position.y) * 0.05
      cameraRef.current.lookAt(sceneRef.current.position)
      
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }

    init()
    gsap.ticker.add(animate)

    return () => {
      gsap.ticker.remove(animate)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onWindowResize)
      
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose()
        if (particlesRef.current.material instanceof THREE.Material) {
          particlesRef.current.material.dispose()
        }
        particlesRef.current = null
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current.domElement.remove()
        rendererRef.current = null
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear()
        sceneRef.current = null
      }
      
      cameraRef.current = null
      
      // Use the stable container reference from the closure
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />
  )
} 