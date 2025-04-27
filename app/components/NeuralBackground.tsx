'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

interface NeuralBackgroundProps {
  children?: React.ReactNode
}

interface DataParticle {
  mesh: THREE.Mesh
  startPoint: THREE.Vector3
  endPoint: THREE.Vector3
  progress: number
  speed: number
  line: THREE.Line
}

// Adjusted cluster y-coordinates to be more centered vertically
const CLUSTERS = [
  { x: -400, y: -50, z: 100, color: '#ff4444', size: 30 }, // Lowered Y
  { x: 0, y: 50, z: 100, color: '#ffdd44', size: 35 },    // Lowered Y
  { x: 400, y: -50, z: 100, color: '#44ddff', size: 30 }     // Lowered Y
]

export default function NeuralBackground({ children }: NeuralBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodesRef = useRef<THREE.Points[]>([])
  const linesRef = useRef<THREE.Line[]>([])
  const textSpritesRef = useRef<THREE.Sprite[]>([])
  const dataParticlesRef = useRef<DataParticle[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const starsRef = useRef<THREE.Points | null>(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)

  // Memoize createDataParticle for better performance
  const createDataParticle = useCallback((line: THREE.Line, color: string, isInterCluster: boolean = false, scene: THREE.Scene) => {
    // Even smaller particles for better performance
    const geometry = new THREE.SphereGeometry(isInterCluster ? 0.3 : 0.7, 6, 6) // Reduced geometry detail
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const mesh = new THREE.Mesh(geometry, material)

    // Get start and end points from line geometry
    const positions = line.geometry.attributes.position.array
    const startPoint = new THREE.Vector3(positions[0], positions[1], positions[2])
    const endPoint = new THREE.Vector3(positions[3], positions[4], positions[5])

    // Simplified glow effect
    const glowGeometry = new THREE.SphereGeometry(isInterCluster ? 1 : 2, 8, 8) // Reduced complexity
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3, // Reduced opacity
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    mesh.add(glow)

    scene.add(mesh)

    return {
      mesh,
      startPoint,
      endPoint,
      progress: 0,
      speed: isInterCluster ? 0.03 + Math.random() * 0.01 : 0.01 + Math.random() * 0.01, // Less variation
      line
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let targetZ = 1000

    // Throttled window event handlers for better performance
    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    let lastMoveTime = 0
    const moveThrottle = 16 // ~60fps
    
    const onMouseMove = (event: MouseEvent) => {
      const now = Date.now()
      if (isDraggingRef.current && now - lastMoveTime > moveThrottle) {
        lastMoveTime = now
        const deltaMove = {
          x: event.clientX - previousMousePositionRef.current.x,
          y: event.clientY - previousMousePositionRef.current.y
        }

        rotationRef.current.x += deltaMove.y * 0.005
        rotationRef.current.y += deltaMove.x * 0.005

        previousMousePositionRef.current = {
          x: event.clientX,
          y: event.clientY
        }
      }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
    }

    // Add mouse event listeners
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    const init = () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
      camera.position.z = 1000
      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x000000, 0.0003)
      sceneRef.current = scene

      // Create Starfield
      const starCount = 10000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const color = new THREE.Color();

      for (let i = 0; i < starCount; i++) {
        // Distribute stars spherically
        const radius = 1500 + Math.random() * 1000; // Adjust radius range
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        // Vary star colors slightly (blues/whites)
        color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.7 + Math.random() * 0.2);
        starColors[i * 3] = color.r;
        starColors[i * 3 + 1] = color.g;
        starColors[i * 3 + 2] = color.b;
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 1.5, // Adjust star size
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true, // Stars shrink with distance
        depthWrite: false, // Prevent stars rendering issues with transparency
      });

      starsRef.current = new THREE.Points(starGeometry, starMaterial);
      scene.add(starsRef.current);

      // Create circuit board base (Adjusted Y position)
      const circuitGeometry = new THREE.PlaneGeometry(2000, 2000, 10, 10)
      const circuitMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a2a3f,
        wireframe: true,
        transparent: true,
        opacity: 0.2 
      })
      const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial)
      circuit.rotation.x = -Math.PI / 2
      circuit.position.y = -200 // Raised the circuit board position
      scene.add(circuit)

      // Create nodes for each cluster (using updated CLUSTERS y-coords)
      CLUSTERS.forEach((cluster) => {
        const nodeGeometry = new THREE.BufferGeometry()
        const nodePositions = []
        const nodeColors = []
        const clusterColor = new THREE.Color(cluster.color)

        // Create nodes in a cluster pattern with fewer nodes
        for (let i = 0; i < cluster.size; i++) {
          // Use gaussian distribution for more natural clustering
          const radius = Math.random() * 150
          const theta = Math.random() * Math.PI * 2
          const phi = Math.random() * Math.PI * 2

          const x = cluster.x + radius * Math.sin(theta) * Math.cos(phi)
          const y = cluster.y + radius * Math.sin(theta) * Math.sin(phi)
          const z = cluster.z + radius * Math.cos(theta)

          nodePositions.push(x, y, z)
          nodeColors.push(clusterColor.r, clusterColor.g, clusterColor.b)
        }

        nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3))
        nodeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nodeColors, 3))

        const nodeMaterial = new THREE.PointsMaterial({
          size: 3, // Reduced from 4
          vertexColors: true,
          transparent: true,
          opacity: 0.7, // Reduced from 0.8
          blending: THREE.AdditiveBlending
        })

        const nodes = new THREE.Points(nodeGeometry, nodeMaterial)
        scene.add(nodes)
        nodesRef.current.push(nodes)

        // Create connections within cluster with fewer connections
        const positions = nodeGeometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
          for (let j = i + 3; j < positions.length; j += 3) {
            const distance = Math.sqrt(
              Math.pow(positions[i] - positions[j], 2) +
              Math.pow(positions[i + 1] - positions[j + 1], 2) +
              Math.pow(positions[i + 2] - positions[j + 2], 2)
            )

            // Reduced connection probability for better performance
            if (distance < 150 && Math.random() > 0.7) { // Changed from 200 and 0.5
              const lineGeometry = new THREE.BufferGeometry()
              const linePositions = [
                positions[i], positions[i + 1], positions[i + 2],
                positions[j], positions[j + 1], positions[j + 2]
              ]
              lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

              const lineMaterial = new THREE.LineBasicMaterial({
                color: cluster.color,
                transparent: true,
                opacity: 0.1,  // Reduced from 0.15
                blending: THREE.AdditiveBlending
              })

              const line = new THREE.Line(lineGeometry, lineMaterial)
              scene.add(line)
              linesRef.current.push(line)
            }
          }
        }

        // Create coordinate labels (Adjusted Y positioning might be needed indirectly via cluster.y)
        // The existing cluster.y + 100 offset should still place labels above clusters
        if (cluster.size > 30) { 
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = 128
          canvas.height = 64

          if (ctx) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            ctx.font = '16px monospace'
            ctx.fillStyle = cluster.color
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            const coords = `[${Math.round(cluster.x)}, ${Math.round(cluster.y)}]`
            ctx.fillText(coords, canvas.width / 2, canvas.height / 2)

            const texture = new THREE.Texture(canvas)
            texture.needsUpdate = true

            const spriteMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              opacity: 0.7
            })

            const sprite = new THREE.Sprite(spriteMaterial)
            // Label position uses the updated cluster.y, potentially shifting it automatically
            sprite.position.set(cluster.x, cluster.y + 100, cluster.z)
            sprite.scale.set(100, 50, 1)
            scene.add(sprite)
            textSpritesRef.current.push(sprite)
          }
        }
      })

      rendererRef.current = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance' // Add power preference for better performance
      })
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Limit pixel ratio
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      
      const canvas = rendererRef.current.domElement
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      
      container.appendChild(canvas)

      // Throttled wheel event
      let lastWheelTime = 0
      const wheelThrottle = 100 // ms
      const onWheel = (event: WheelEvent) => {
        const now = Date.now()
        if (now - lastWheelTime > wheelThrottle) {
          lastWheelTime = now
          targetZ = Math.max(500, Math.min(2000, targetZ + event.deltaY))
        }
      }

      window.addEventListener('wheel', onWheel)
      
      // Debounced resize handler
      let resizeTimeout: number | null = null
      const onWindowResize = () => {
        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout)
        }
        
        resizeTimeout = window.setTimeout(() => {
          if (!containerRef.current) return

          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()

          rendererRef.current?.setSize(window.innerWidth, window.innerHeight)
        }, 100)
      }

      window.addEventListener('resize', onWindowResize)

      // Initialize data particles (fewer particles)
      const initDataParticles = () => {
        // Clear existing particles
        dataParticlesRef.current.forEach(particle => {
          scene.remove(particle.mesh)
        })
        dataParticlesRef.current = []

        // Create new particles on random lines (fewer particles)
        const maxParticles = 20 // Limit total particles
        let particleCount = 0
        
        for (let i = 0; i < linesRef.current.length && particleCount < maxParticles; i++) {
          const line = linesRef.current[i]
          if (!line || !line.material) continue
          
          const material = line.material as THREE.LineBasicMaterial
          const isInterCluster = material.color.getHex() === 0xffffff
          
          if (Math.random() > (isInterCluster ? 0.9 : 0.8)) {
            const particle = createDataParticle(
              line,
              material.color.getStyle(),
              isInterCluster,
              scene
            )
            dataParticlesRef.current.push(particle)
            particleCount++
          }
        }
      }

      initDataParticles()

      // Periodically create new particles (less frequently)
      const particleInterval = setInterval(() => {
        // Limit number of active particles
        if (dataParticlesRef.current.length >= 25) return
        
        if (Math.random() > 0.8 && linesRef.current.length > 0 && sceneRef.current) {
          const randomLine = linesRef.current[Math.floor(Math.random() * linesRef.current.length)]
          if (!randomLine || !randomLine.material) return
          
          const material = randomLine.material as THREE.LineBasicMaterial
          const isInterCluster = material.color.getHex() === 0xffffff
          
          const particle = createDataParticle(
            randomLine,
            material.color.getStyle(),
            isInterCluster,
            sceneRef.current
          )
          dataParticlesRef.current.push(particle)
        }
      }, 400) // Reduced frequency (from 200ms to 400ms)
      
      return particleInterval
    }

    const particleInterval = init()

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current) return

      // Apply rotation from dragging
      if (sceneRef.current) {
        sceneRef.current.rotation.x = rotationRef.current.x
        sceneRef.current.rotation.y = rotationRef.current.y
      }

      // Subtle rotation for the starfield
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00005; 
        starsRef.current.rotation.x += 0.00002;
      }

      // Update data particles (throttled)
      dataParticlesRef.current.forEach((particle, index) => {
        particle.progress += particle.speed
        
        if (particle.progress >= 1) {
          sceneRef.current?.remove(particle.mesh)
          dataParticlesRef.current.splice(index, 1)
        } else {
          const newX = particle.startPoint.x + (particle.endPoint.x - particle.startPoint.x) * particle.progress
          const newY = particle.startPoint.y + (particle.endPoint.y - particle.startPoint.y) * particle.progress
          const newZ = particle.startPoint.z + (particle.endPoint.z - particle.startPoint.z) * particle.progress
          particle.mesh.position.set(newX, newY, newZ)

          // Less frequent pulse update (only every 4th frame)
          if (frameRef.current % 4 === 0) {
            const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8 // Reduced intensity
            if (particle.mesh.children[0]) {
              particle.mesh.children[0].scale.set(pulse, pulse, pulse)
            }
          }
        }
      })
      
      frameRef.current++

      camera.position.z += (targetZ - camera.position.z) * 0.05
      rendererRef.current.render(scene, camera)
    }

    gsap.ticker.add(animate)

    return () => {
      gsap.ticker.remove(animate)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      
      // Store ref values before cleanup
      const currentRenderer = rendererRef.current
      const currentScene = sceneRef.current
      
      if (currentRenderer) {
        currentRenderer.dispose()
        currentRenderer.domElement.remove()
        rendererRef.current = null
      }
      
      dataParticlesRef.current.forEach(particle => {
        currentScene?.remove(particle.mesh)
      })
      
      dataParticlesRef.current = []
      nodesRef.current = []
      linesRef.current = []
      textSpritesRef.current = []
      
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
      
      clearInterval(particleInterval)

      // Cleanup stars
      if (starsRef.current) {
        currentScene?.remove(starsRef.current);
        starsRef.current.geometry.dispose();
        (starsRef.current.material as THREE.Material).dispose(); // Type assertion for dispose
        starsRef.current = null;
      }
    }
  }, [createDataParticle])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
      {children}
    </div>
  )
} 