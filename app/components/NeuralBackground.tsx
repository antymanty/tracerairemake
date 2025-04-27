'use client'

import React, { useEffect, useRef, useCallback } from 'react'
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

// --- NEW STRUCTURE CONFIGURATION ---
const CORE_CONFIG = {
  position: { x: 0, y: 0, z: 0 },
  color: '#00ffff', // Bright Cyan
  nodeCount: 100, // Denser core
  radius: 100,     // Smaller radius for density
  connectionDistance: 120, // Connect nodes closer together
  connectionProbability: 0.4, // Higher connection chance
};

const NUM_PERIPHERALS = 6;
const PERIPHERAL_CONFIG = {
  distanceFromCore: 400,
  nodeCount: 25, // Sparser
  radius: 80,     // Smaller clusters
  colors: ['#FF66FF', '#FF9933', '#66FF66', '#FFFF66', '#66B2FF', '#FF6666'], // Magenta, Orange, Green, Yellow, Light Blue, Red
  connectionDistance: 100,
  connectionProbability: 0.2,
  coreConnectionProbability: 0.05, // Chance to connect peripheral node to a core node
};
// --- END NEW STRUCTURE CONFIGURATION ---

export default function NeuralBackground({ children }: NeuralBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const coreNodesRef = useRef<THREE.Points | null>(null); // Ref for core nodes
  const peripheralNodesRefs = useRef<THREE.Points[]>([]); // Array for peripheral nodes
  const coreLinesRef = useRef<THREE.LineSegments | null>(null); // Ref for core lines
  const peripheralLinesRefs = useRef<THREE.LineSegments[]>([]); // Array for peripheral lines
  const corePeripheralLinesRef = useRef<THREE.LineSegments | null>(null); // Ref for core-peripheral lines
  const dataParticlesRef = useRef<DataParticle[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const starsRef = useRef<THREE.Points | null>(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)
  const groupRef = useRef<THREE.Group | null>(null); // Group to hold network elements for easier rotation

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

      groupRef.current = new THREE.Group(); // Create the group
      scene.add(groupRef.current);

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
      const circuitGeometry = new THREE.PlaneGeometry(2500, 2500, 15, 15) // Slightly larger, more segments
      const circuitMaterial = new THREE.MeshBasicMaterial({
        color: 0x051520, // Darker blue-grey
        wireframe: true,
        transparent: true,
        opacity: 0.1 // More transparent
      })
      const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial)
      circuit.rotation.x = -Math.PI / 2
      circuit.position.y = -300 // Position it further down
      groupRef.current?.add(circuit) // Add to group

      // --- Generate Nodes Function ---
      const generateNodes = (count: number, center: THREE.Vector3, radius: number, colorVal: string | number): [Float32Array, Float32Array] => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color(colorVal);

        for (let i = 0; i < count; i++) {
          // Spherical distribution within the radius
          const r = radius * Math.cbrt(Math.random()); // Cube root for uniform volume distribution
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);

          const x = center.x + r * Math.sin(phi) * Math.cos(theta);
          const y = center.y + r * Math.sin(phi) * Math.sin(theta);
          const z = center.z + r * Math.cos(phi);

          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;

          // Add slight color variation
          const hsl = { h: 0, s: 0, l: 0 };
          color.getHSL(hsl);
          color.setHSL(hsl.h, hsl.s, hsl.l * (0.8 + Math.random() * 0.4));

          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        return [positions, colors];
      };

      // --- Generate Lines Function ---
      const generateLines = (positions: Float32Array, maxDistance: number, probability: number): Float32Array => {
          const lines: number[] = [];
          const numPoints = positions.length / 3;
          for (let i = 0; i < numPoints; i++) {
            for (let j = i + 1; j < numPoints; j++) {
                 if (Math.random() > probability) continue; // Skip based on probability

                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    lines.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                    lines.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
                }
            }
          }
          return new Float32Array(lines);
      };
      
      // --- Create Core Nodes ---
      const coreCenter = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
      const [coreNodePositions, coreNodeColors] = generateNodes(CORE_CONFIG.nodeCount, coreCenter, CORE_CONFIG.radius, CORE_CONFIG.color);
      const coreGeometry = new THREE.BufferGeometry();
      coreGeometry.setAttribute('position', new THREE.BufferAttribute(coreNodePositions, 3));
      coreGeometry.setAttribute('color', new THREE.BufferAttribute(coreNodeColors, 3));
      const coreMaterial = new THREE.PointsMaterial({
        size: 3.5, // Slightly larger core nodes
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
      });
      coreNodesRef.current = new THREE.Points(coreGeometry, coreMaterial);
      groupRef.current?.add(coreNodesRef.current);

      // --- Create Core Lines ---
      const coreLinePositions = generateLines(coreNodePositions, CORE_CONFIG.connectionDistance, CORE_CONFIG.connectionProbability);
      const coreLineGeometry = new THREE.BufferGeometry();
      coreLineGeometry.setAttribute('position', new THREE.BufferAttribute(coreLinePositions, 3));
      const coreLineMaterial = new THREE.LineBasicMaterial({ 
          color: CORE_CONFIG.color, 
          transparent: true, 
          opacity: 0.15, // Slightly more visible core lines
          blending: THREE.AdditiveBlending 
      });
      // Use LineSegments for performance with many lines
      coreLinesRef.current = new THREE.LineSegments(coreLineGeometry, coreLineMaterial);
      groupRef.current?.add(coreLinesRef.current);
      
      // --- Create Peripheral Nodes & Lines ---
      const allPeripheralPositions: number[] = []; // Store all for core connections
      peripheralNodesRefs.current = [];
      peripheralLinesRefs.current = [];

      for (let i = 0; i < NUM_PERIPHERALS; i++) {
        // Calculate peripheral position spherically around core
        const angleTheta = (i / NUM_PERIPHERALS) * Math.PI * 2;
        const anglePhi = Math.PI / 3 + (Math.random() - 0.5) * (Math.PI / 4); // Angle from Y-axis with some randomness
        const periCenter = new THREE.Vector3(
          coreCenter.x + PERIPHERAL_CONFIG.distanceFromCore * Math.sin(anglePhi) * Math.cos(angleTheta),
          coreCenter.y + PERIPHERAL_CONFIG.distanceFromCore * Math.cos(anglePhi),
          coreCenter.z + PERIPHERAL_CONFIG.distanceFromCore * Math.sin(anglePhi) * Math.sin(angleTheta)
        );
        const periColor = PERIPHERAL_CONFIG.colors[i % PERIPHERAL_CONFIG.colors.length];

        // Generate Peripheral Nodes
        const [periNodePositions, periNodeColors] = generateNodes(PERIPHERAL_CONFIG.nodeCount, periCenter, PERIPHERAL_CONFIG.radius, periColor);
        allPeripheralPositions.push(...Array.from(periNodePositions));
        const periGeometry = new THREE.BufferGeometry();
        periGeometry.setAttribute('position', new THREE.BufferAttribute(periNodePositions, 3));
        periGeometry.setAttribute('color', new THREE.BufferAttribute(periNodeColors, 3));
        const periMaterial = new THREE.PointsMaterial({ 
            size: 2.5, // Smaller peripheral nodes
            vertexColors: true, 
            transparent: true, 
            opacity: 0.8, 
            blending: THREE.AdditiveBlending, 
            sizeAttenuation: true,
            depthWrite: false,
        });
        const peripheralNodes = new THREE.Points(periGeometry, periMaterial);
        groupRef.current?.add(peripheralNodes);
        peripheralNodesRefs.current.push(peripheralNodes);

        // Generate Peripheral Lines (within the cluster)
        const periLinePositions = generateLines(periNodePositions, PERIPHERAL_CONFIG.connectionDistance, PERIPHERAL_CONFIG.connectionProbability);
        const periLineGeometry = new THREE.BufferGeometry();
        periLineGeometry.setAttribute('position', new THREE.BufferAttribute(periLinePositions, 3));
        const periLineMaterial = new THREE.LineBasicMaterial({ color: periColor, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending });
        const peripheralLines = new THREE.LineSegments(periLineGeometry, periLineMaterial);
        groupRef.current?.add(peripheralLines);
        peripheralLinesRefs.current.push(peripheralLines);
      }

      // --- Create Core-Peripheral Lines ---
      const corePeripheralLinePoints: number[] = [];
      const numCoreNodes = coreNodePositions.length / 3;
      const numPeriNodes = allPeripheralPositions.length / 3;
      for(let i = 0; i < numCoreNodes; i++) {
          for(let j = 0; j < numPeriNodes; j++) {
              if (Math.random() < PERIPHERAL_CONFIG.coreConnectionProbability) {
                  // Add line segment
                  corePeripheralLinePoints.push(coreNodePositions[i * 3], coreNodePositions[i * 3 + 1], coreNodePositions[i * 3 + 2]);
                  corePeripheralLinePoints.push(allPeripheralPositions[j * 3], allPeripheralPositions[j * 3 + 1], allPeripheralPositions[j * 3 + 2]);
              }
          }
      }
       const cpLineGeometry = new THREE.BufferGeometry();
       cpLineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(corePeripheralLinePoints), 3));
       const cpLineMaterial = new THREE.LineBasicMaterial({ 
           color: 0xaaaaaa, // Neutral color for these connections
           transparent: true, 
           opacity: 0.05, // Very faint
           blending: THREE.AdditiveBlending 
       });
       corePeripheralLinesRef.current = new THREE.LineSegments(cpLineGeometry, cpLineMaterial);
       groupRef.current?.add(corePeripheralLinesRef.current);

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
        // TODO: Revise this logic. Need to select lines from core, peripheral, and core-peripheral groups.
        // For now, disable particle generation until revised.
        dataParticlesRef.current.forEach(particle => scene.remove(particle.mesh))
        dataParticlesRef.current = [];
      }
      initDataParticles();

      return null; // Return null as interval is disabled for now
    }

    init(); // Run init but don't capture interval yet

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current) return;

      // Apply rotation from dragging TO THE GROUP
      if (groupRef.current) {
          // Apply smooth rotation damping
          const targetRotationX = rotationRef.current.x;
          const targetRotationY = rotationRef.current.y;
          groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
          groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      }
      
      // Subtle rotation for the starfield (separate from group)
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00005; 
        starsRef.current.rotation.x += 0.00002;
      }
      
      frameRef.current++;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      rendererRef.current.render(scene, camera);
    }

    gsap.ticker.add(animate);

    return () => {
      gsap.ticker.remove(animate);
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      
      const currentRenderer = rendererRef.current;
      const currentScene = sceneRef.current;
      const currentGroup = groupRef.current;
      
      // Cleanup THREE.js objects
      const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
          if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
          } else {
              material.dispose();
          }
      };
      const disposeObject = (obj: THREE.Object3D | null) => {
          if (!obj) return;
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) disposeMaterial(obj.material);
          }
          while(obj.children.length > 0){
              disposeObject(obj.children[0]);
              obj.remove(obj.children[0]);
          }
      };

      disposeObject(currentGroup);
      currentScene?.remove(currentGroup as THREE.Group);
      groupRef.current = null;

      disposeObject(starsRef.current); // Dispose stars separately
      currentScene?.remove(starsRef.current as THREE.Points);
      starsRef.current = null;

      // Clear remaining refs
      coreNodesRef.current = null;
      peripheralNodesRefs.current = [];
      coreLinesRef.current = null;
      peripheralLinesRefs.current = [];
      corePeripheralLinesRef.current = null;
      dataParticlesRef.current = [];
      
      if (currentRenderer) {
        currentRenderer.dispose();
        if (currentRenderer.domElement.parentNode) {
            currentRenderer.domElement.parentNode.removeChild(currentRenderer.domElement);
        }
        rendererRef.current = null;
      }
      
      if (container) {
          while (container.firstChild) {
              container.removeChild(container.firstChild);
          }
      }
    }
  }, [createDataParticle]) // createDataParticle might need update if args change

  return (
    <div ref={containerRef} className="fixed inset-0 z-0">
      {children}
    </div>
  )
} 