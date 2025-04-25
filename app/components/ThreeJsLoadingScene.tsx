'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ThreeJsLoadingSceneProps {
  children?: React.ReactNode
}

export default function ThreeJsLoadingScene({ children }: ThreeJsLoadingSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!mountRef.current) return
    
    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)
    
    // Create a cube
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const wireframe = new THREE.WireframeGeometry(geometry)
    const material = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    })
    
    const cube = new THREE.LineSegments(wireframe, material)
    scene.add(cube)
    
    // Add some particles around the cube
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const posArray = new Float32Array(particleCount * 3)
    
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    })
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)
    
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
      
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      
      particlesMesh.rotation.x += 0.001
      particlesMesh.rotation.y += 0.001
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
      scene.remove(cube)
      scene.remove(particlesMesh)
      geometry.dispose()
      wireframe.dispose()
      material.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
    }
  }, [])
  
  return (
    <div ref={mountRef} className="fixed inset-0 z-0">
      {children}
    </div>
  )
} 