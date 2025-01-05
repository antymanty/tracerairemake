'use client'

import { useEffect, useRef } from 'react'
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

const CLUSTERS = [
  { x: -400, y: 100, z: 0, color: '#ff4444', size: 40 },  // Red cluster
  { x: 0, y: 200, z: 0, color: '#ffdd44', size: 50 },     // Yellow cluster
  { x: 400, y: 100, z: 0, color: '#44ddff', size: 45 },   // Blue cluster
  { x: 0, y: -100, z: 0, color: '#ffaa44', size: 35 }     // Orange cluster
]

export default function NeuralBackground({ children }: NeuralBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodesRef = useRef<THREE.Points[]>([])
  const linesRef = useRef<THREE.Line[]>([])
  const textSpritesRef = useRef<THREE.Sprite[]>([])
  const dataParticlesRef = useRef<DataParticle[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let mouseX = 0, mouseY = 0
    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2
    let targetZ = 1000

    const createDataParticle = (line: THREE.Line, color: string, isInterCluster: boolean = false) => {
      // Smaller particles (1 unit for regular, 0.5 for inter-cluster)
      const geometry = new THREE.SphereGeometry(isInterCluster ? 0.5 : 1, 8, 8)
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

      // Add glow effect (smaller for inter-cluster)
      const glowGeometry = new THREE.SphereGeometry(isInterCluster ? 2 : 3, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
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
        speed: isInterCluster ? 0.04 + Math.random() * 0.02 : 0.01 + Math.random() * 0.02, // Faster for inter-cluster
        line
      }
    }

    // Mouse event handlers for dragging
    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (isDraggingRef.current) {
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
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000)
      camera.position.z = 1000
      scene = new THREE.Scene()
      sceneRef.current = scene

      // Create circuit board base
      const circuitGeometry = new THREE.PlaneGeometry(2000, 2000, 20, 20)
      const circuitMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a2a3f,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
      const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial)
      circuit.rotation.x = -Math.PI / 2
      circuit.position.y = -200
      scene.add(circuit)

      // Create nodes for each cluster
      CLUSTERS.forEach((cluster, clusterIndex) => {
        const nodeGeometry = new THREE.BufferGeometry()
        const nodePositions = []
        const nodeColors = []
        const clusterColor = new THREE.Color(cluster.color)

        // Create nodes in a cluster pattern
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
          size: 4,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        })

        const nodes = new THREE.Points(nodeGeometry, nodeMaterial)
        scene.add(nodes)
        nodesRef.current.push(nodes)

        // Create connections within cluster
        const positions = nodeGeometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
          for (let j = i + 3; j < positions.length; j += 3) {
            const distance = Math.sqrt(
              Math.pow(positions[i] - positions[j], 2) +
              Math.pow(positions[i + 1] - positions[j + 1], 2) +
              Math.pow(positions[i + 2] - positions[j + 2], 2)
            )

            if (distance < 100 && Math.random() > 0.85) {
              const lineGeometry = new THREE.BufferGeometry()
              const linePositions = [
                positions[i], positions[i + 1], positions[i + 2],
                positions[j], positions[j + 1], positions[j + 2]
              ]
              lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

              const lineMaterial = new THREE.LineBasicMaterial({
                color: cluster.color,
                transparent: true,
                opacity: 0.2,
                blending: THREE.AdditiveBlending
              })

              const line = new THREE.Line(lineGeometry, lineMaterial)
              scene.add(line)
              linesRef.current.push(line)
            }
          }
        }

        // Create connections between clusters
        if (clusterIndex > 0) {
          const prevCluster = nodesRef.current[clusterIndex - 1]
          const prevPositions = prevCluster.geometry.attributes.position.array
          
          for (let i = 0; i < positions.length; i += 30) {
            for (let j = 0; j < prevPositions.length; j += 30) {
              const lineGeometry = new THREE.BufferGeometry()
              const linePositions = [
                positions[i], positions[i + 1], positions[i + 2],
                prevPositions[j], prevPositions[j + 1], prevPositions[j + 2]
              ]
              lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending
              })

              const line = new THREE.Line(lineGeometry, lineMaterial)
              scene.add(line)
              linesRef.current.push(line)
            }
          }
        }

        // Add coordinate labels
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
            opacity: 0.8
          })

          const sprite = new THREE.Sprite(spriteMaterial)
          sprite.position.set(cluster.x, cluster.y + 100, cluster.z)
          sprite.scale.set(100, 50, 1)
          scene.add(sprite)
          textSpritesRef.current.push(sprite)
        }
      })

      rendererRef.current = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
      })
      rendererRef.current.setPixelRatio(window.devicePixelRatio)
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      
      const canvas = rendererRef.current.domElement
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      
      containerRef.current?.appendChild(canvas)

      window.addEventListener('wheel', onWheel)
      window.addEventListener('resize', onWindowResize)

      // Initialize data particles
      const initDataParticles = () => {
        // Clear existing particles
        dataParticlesRef.current.forEach(particle => {
          scene.remove(particle.mesh)
        })
        dataParticlesRef.current = []

        // Create new particles on random lines
        linesRef.current.forEach(line => {
          if (!line || !line.material) return // Skip if line or material is undefined
          
          const material = line.material as THREE.LineBasicMaterial
          const isInterCluster = material.color.getHex() === 0xffffff
          
          if (Math.random() > (isInterCluster ? 0.8 : 0.7)) {
            const particle = createDataParticle(
              line,
              material.color.getStyle(),
              isInterCluster
            )
            dataParticlesRef.current.push(particle)
          }
        })
      }

      initDataParticles()

      // Periodically create new particles
      setInterval(() => {
        if (Math.random() > 0.7 && linesRef.current.length > 0) {
          const randomLine = linesRef.current[Math.floor(Math.random() * linesRef.current.length)]
          if (!randomLine || !randomLine.material) return // Skip if line or material is undefined
          
          const material = randomLine.material as THREE.LineBasicMaterial
          const isInterCluster = material.color.getHex() === 0xffffff
          
          const particle = createDataParticle(
            randomLine,
            material.color.getStyle(),
            isInterCluster
          )
          dataParticlesRef.current.push(particle)
        }
      }, 200)
    }

    const onWheel = (event: WheelEvent) => {
      targetZ = Math.max(500, Math.min(2000, targetZ + event.deltaY))
    }

    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2
      windowHalfY = window.innerHeight / 2
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      rendererRef.current?.setSize(window.innerWidth, window.innerHeight)
    }

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current) return

      // Apply rotation from dragging
      scene.rotation.x = rotationRef.current.x
      scene.rotation.y = rotationRef.current.y

      // Update data particles
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

          const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7
          particle.mesh.children[0].scale.set(pulse, pulse, pulse)
        }
      })

      camera.position.z += (targetZ - camera.position.z) * 0.05
      rendererRef.current.render(scene, camera)
    }

    init()
    gsap.ticker.add(animate)

    return () => {
      gsap.ticker.remove(animate)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onWindowResize)
      if (rendererRef.current) {
        rendererRef.current.dispose()
        rendererRef.current.domElement.remove()
        rendererRef.current = null
      }
      dataParticlesRef.current.forEach(particle => {
        sceneRef.current?.remove(particle.mesh)
      })
      dataParticlesRef.current = []
      nodesRef.current = []
      linesRef.current = []
      textSpritesRef.current = []
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
      {children}
    </div>
  )
} 