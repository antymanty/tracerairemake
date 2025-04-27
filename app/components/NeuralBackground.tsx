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
  direction: 1 | -1
  life: number
}

// --- NEW STRUCTURE CONFIGURATION (Adjusted for Clarity & Signals) ---
const CORE_CONFIG = {
  position: { x: 0, y: 0, z: 0 },
  color: '#00ffff', 
  nodeCount: 70, // Further reduced
  radius: 120,    // Slightly larger core space
  connectionDistance: 140, 
  connectionProbability: 0.25, // Slightly Reduced 
  nodeSize: 3.0,
};

const NUM_PERIPHERALS = 6;
const PERIPHERAL_CONFIG = {
  distanceFromCore: 450, 
  nodeCount: 18, // Further reduced
  radius: 70,    
  colors: ['#FF66FF', '#FF9933', '#66FF66', '#FFFF66', '#66B2FF', '#FF6666'],
  connectionDistance: 90, // Reduced distance
  connectionProbability: 0.12, // Further reduced
  coreConnectionProbability: 0.008, // Drastically reduced interconnects
  nodeSize: 2.0, 
};
// --- END ADJUSTED CONFIGURATION ---

// Define line types
type LineInfo = {
  lineSegments: THREE.LineSegments;
  type: 'core' | 'peripheral' | 'interconnect';
  color?: string | number; // Store color for particle matching
}

export default function NeuralBackground({ children }: NeuralBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const coreNodeMeshesRef = useRef<THREE.Mesh[]>([])
  const peripheralNodeMeshesRef = useRef<THREE.Mesh[][]>([[]])
  const allLinesRef = useRef<LineInfo[]>([])
  const dataParticlesRef = useRef<DataParticle[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const starsRef = useRef<THREE.Points | null>(null)
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)
  const groupRef = useRef<THREE.Group | null>(null)

  // Memoize createDataParticle for better performance
  const createDataParticle = useCallback((line: THREE.Line, color: string | number, scene: THREE.Scene, lineType: LineInfo['type']) => {
    const particleSize = lineType === 'interconnect' ? 1.8 : 1.2;
    const geometry = new THREE.SphereGeometry(particleSize, 8, 8); 
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 1.0, 
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const positions = line.geometry.attributes.position.array;
    // Determine initial direction: Start from core for interconnects? Or random?
    // Let's make interconnects randomly start from either end.
    let startPoint: THREE.Vector3;
    let endPoint: THREE.Vector3;
    let initialDirection: 1 | -1 = 1;
    let initialProgress = 0;

    if (lineType === 'interconnect' && Math.random() > 0.5) {
        // Start from peripheral end, move towards core
        startPoint = new THREE.Vector3(positions[3], positions[4], positions[5]);
        endPoint = new THREE.Vector3(positions[0], positions[1], positions[2]);
        // If we start at the 'end', progress is technically 1, moving backwards
        // initialProgress = 1;
        // initialDirection = -1; 
        // --> Simpler: Just swap points and keep progress 0, direction 1
    } else {
        // Start from core (or first point for other types)
        startPoint = new THREE.Vector3(positions[0], positions[1], positions[2]);
        endPoint = new THREE.Vector3(positions[3], positions[4], positions[5]);
    }

    mesh.position.copy(startPoint);
    scene.add(mesh);

    let speedFactor = 1.0;
    if (lineType === 'core') speedFactor = 1.2; // Slightly slower core internal
    if (lineType === 'interconnect') speedFactor = 2.0; // Faster interconnects

    return {
      mesh,
      startPoint,
      endPoint,
      progress: initialProgress,
      speed: (0.03 + Math.random() * 0.02) * speedFactor, // Adjusted base speed
      direction: initialDirection,
      life: 2 + Math.floor(Math.random() * 3), // Particle lasts for 2-4 full traversals (back and forth = 1 traversal)
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let targetZ = 1000;
    let lastMoveTime = 0; 
    const moveThrottle = 16; 
    let resizeTimeout: number | null = null; 
    let particleTimeout: NodeJS.Timeout | null = null; 

    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
      container.style.cursor = 'grabbing'; // Simple grab cursor
    };

    const onMouseMove = (event: MouseEvent) => {
       if (!isDraggingRef.current) return;
       const now = Date.now();
       if (now - lastMoveTime < moveThrottle) return; 
       lastMoveTime = now;

       const deltaMove = { x: event.clientX - previousMousePositionRef.current.x, y: event.clientY - previousMousePositionRef.current.y };

       // Only rotation logic remains
       rotationRef.current.x += deltaMove.y * 0.005;
       rotationRef.current.y += deltaMove.x * 0.005;
       rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x)); // Clamp rotation

       previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'default'; // Restore default cursor
    };
    
    const onWheel = (event: WheelEvent) => {
        const now = Date.now();
        // Basic throttling for wheel zoom
        if (now - lastMoveTime > 50) { // Shorter throttle for zoom?
          lastMoveTime = now;
          // Simple targetZ adjustment
          targetZ = Math.max(400, Math.min(2500, targetZ + event.deltaY * 0.5)); // Adjusted sensitivity
        }
    };
    
    const onWindowResize = () => {
        if (resizeTimeout) window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          if (!containerRef.current || !camera || !rendererRef.current) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }, 150);
    };

    // --- Init Function ---
    const init = () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000)
      camera.position.z = targetZ
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

      // --- Generate Nodes Function (MODIFIED to return Meshes) ---
      const generateNodeMeshes = (count: number, center: THREE.Vector3, radius: number, baseColorVal: string | number, nodeSize: number): THREE.Mesh[] => {
        const meshes: THREE.Mesh[] = [];
        const baseColor = new THREE.Color(baseColorVal);
        
        for (let i = 0; i < count; i++) {
          // Spherical distribution 
          const r = radius * Math.cbrt(Math.random()); 
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const position = new THREE.Vector3(
            center.x + r * Math.sin(phi) * Math.cos(theta),
            center.y + r * Math.sin(phi) * Math.sin(theta),
            center.z + r * Math.cos(phi)
          );

          // Create geometry (unique for potential size variation)
          const finalNodeSize = nodeSize * (0.8 + Math.random() * 0.4); // Size variation
          const geometry = new THREE.SphereGeometry(finalNodeSize / 2, 8, 6); // Simple sphere

          // Create material (slightly varied color)
          const nodeColor = baseColor.clone();
          const hsl = { h: 0, s: 0, l: 0 };
          nodeColor.getHSL(hsl);
          nodeColor.setHSL(hsl.h, hsl.s, hsl.l * (0.9 + Math.random() * 0.2));

          const material = new THREE.MeshBasicMaterial({
            color: nodeColor,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            // side: THREE.DoubleSide // Might help if inside looks odd
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          meshes.push(mesh);
        }
        return meshes;
      };

      // --- Generate Lines Function (MODIFIED to use Meshes) ---
      const generateLinesFromMeshes = (nodes1: THREE.Mesh[], nodes2: THREE.Mesh[], maxDistance: number, probability: number): Float32Array => {
          const lines: number[] = [];
          const singleGroup = nodes1 === nodes2;

          for (let i = 0; i < nodes1.length; i++) {
            // If single group, start j from i+1 to avoid self-connections and duplicates
            // If two groups, start j from 0
            const startJ = singleGroup ? i + 1 : 0; 
            for (let j = startJ; j < nodes2.length; j++) {
                 if (Math.random() > probability) continue;

                 const p1 = nodes1[i].position;
                 const p2 = nodes2[j].position;
                 const distance = p1.distanceTo(p2);

                 if (distance < maxDistance) {
                    lines.push(p1.x, p1.y, p1.z);
                    lines.push(p2.x, p2.y, p2.z);
                }
            }
          }
          return new Float32Array(lines);
      };
      
      // --- Create Core Nodes (as Meshes) ---
      const coreCenter = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
      coreNodeMeshesRef.current = generateNodeMeshes(CORE_CONFIG.nodeCount, coreCenter, CORE_CONFIG.radius, CORE_CONFIG.color, CORE_CONFIG.nodeSize);
      coreNodeMeshesRef.current.forEach(mesh => groupRef.current?.add(mesh));

      // --- Create Core Lines (using Meshes) ---
      const coreLinePositions = generateLinesFromMeshes(coreNodeMeshesRef.current, coreNodeMeshesRef.current, CORE_CONFIG.connectionDistance, CORE_CONFIG.connectionProbability);
      const coreLineGeometry = new THREE.BufferGeometry();
      coreLineGeometry.setAttribute('position', new THREE.BufferAttribute(coreLinePositions, 3));
      const coreLineMaterial = new THREE.LineBasicMaterial({ 
          color: CORE_CONFIG.color, 
          transparent: true, 
          opacity: 0.3, // Slightly increased opacity
          blending: THREE.AdditiveBlending 
      });
      const coreLineSegments = new THREE.LineSegments(coreLineGeometry, coreLineMaterial);
      groupRef.current?.add(coreLineSegments);
      allLinesRef.current.push({ lineSegments: coreLineSegments, type: 'core', color: CORE_CONFIG.color });

      // --- Create Peripheral Nodes & Lines (Adjusted Opacity) ---
      const allPeripheralNodeMeshes: THREE.Mesh[] = [];
      peripheralNodeMeshesRef.current = []; // Ensure it's reset

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
        // Generate Peripheral Node Meshes
        const currentPeripheralMeshes = generateNodeMeshes(PERIPHERAL_CONFIG.nodeCount, periCenter, PERIPHERAL_CONFIG.radius, periColor, PERIPHERAL_CONFIG.nodeSize);
        currentPeripheralMeshes.forEach(mesh => groupRef.current?.add(mesh));
        peripheralNodeMeshesRef.current.push(currentPeripheralMeshes); // Store array of meshes
        allPeripheralNodeMeshes.push(...currentPeripheralMeshes);

        // Generate Peripheral Lines (within the cluster)
        const periLinePositions = generateLinesFromMeshes(currentPeripheralMeshes, currentPeripheralMeshes, PERIPHERAL_CONFIG.connectionDistance, PERIPHERAL_CONFIG.connectionProbability);
        const periLineGeometry = new THREE.BufferGeometry();
        periLineGeometry.setAttribute('position', new THREE.BufferAttribute(periLinePositions, 3));
        const periLineMaterial = new THREE.LineBasicMaterial({ 
            color: periColor, 
            transparent: true, 
            opacity: 0.2, // Slightly increased opacity
            blending: THREE.AdditiveBlending 
        });
        const peripheralLineSegments = new THREE.LineSegments(periLineGeometry, periLineMaterial);
        groupRef.current?.add(peripheralLineSegments);
        allLinesRef.current.push({ lineSegments: peripheralLineSegments, type: 'peripheral', color: periColor });
      }

      // --- Create Core-Peripheral Lines (using Meshes) ---
      const corePeripheralLinePoints = generateLinesFromMeshes(coreNodeMeshesRef.current, allPeripheralNodeMeshes, PERIPHERAL_CONFIG.distanceFromCore * 1.1, PERIPHERAL_CONFIG.coreConnectionProbability); 
      const cpLineGeometry = new THREE.BufferGeometry(); // Declare here
      // Use the declared variable below
      cpLineGeometry.setAttribute('position', new THREE.BufferAttribute(corePeripheralLinePoints, 3)); 
      const cpLineMaterial = new THREE.LineBasicMaterial({ 
           color: 0xaaaaaa, 
           transparent: true, 
           opacity: 0.05, 
           blending: THREE.AdditiveBlending 
       });
       const cpLineSegments = new THREE.LineSegments(cpLineGeometry, cpLineMaterial);
       groupRef.current?.add(cpLineSegments);
       allLinesRef.current.push({ lineSegments: cpLineSegments, type: 'interconnect', color: 0xaaaaaa });

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

      // Initialize data particles (fewer particles)
      const initDataParticles = (count: number) => {
         dataParticlesRef.current.forEach(particle => scene.remove(particle.mesh));
         dataParticlesRef.current = [];
         let createdCount = 0;
         const interconnectLines = allLinesRef.current.filter(l => l.type === 'interconnect');
         const coreLines = allLinesRef.current.filter(l => l.type === 'core');
         
         while (createdCount < count && (interconnectLines.length > 0 || coreLines.length > 0)) {
             // Prioritize interconnect lines
             let lineInfo: LineInfo | undefined;
             if (interconnectLines.length > 0 && Math.random() < 0.8) { // 80% chance for interconnect
                lineInfo = interconnectLines[Math.floor(Math.random() * interconnectLines.length)];
             } else if (coreLines.length > 0) { // 20% chance for core
                 lineInfo = coreLines[Math.floor(Math.random() * coreLines.length)];
             }
             if (!lineInfo) continue;

             // ... (rest of segment picking logic from previous step) ...
             const geometry = lineInfo.lineSegments.geometry;
             const positions = geometry.attributes.position.array;
             const numSegments = positions.length / 6;
             if (numSegments === 0) continue;
             const segmentIndex = Math.floor(Math.random() * numSegments);
             const startIndex = segmentIndex * 6;
             const segmentPoints = [
                 new THREE.Vector3(positions[startIndex], positions[startIndex+1], positions[startIndex+2]),
                 new THREE.Vector3(positions[startIndex+3], positions[startIndex+4], positions[startIndex+5])
             ];
             const segmentGeometry = new THREE.BufferGeometry().setFromPoints(segmentPoints);
             const tempLine = new THREE.Line(segmentGeometry, new THREE.LineBasicMaterial()); 

             const particle = createDataParticle(
                 tempLine, 
                 lineInfo.color || 0xffffff, 
                 scene,
                 lineInfo.type // Pass line type
             );
             dataParticlesRef.current.push(particle);
             createdCount++;
             segmentGeometry.dispose(); 
         }
      };
      initDataParticles(20); // Initial particles

      // --- Periodically Create New Particles (Focus on Interconnect) ---
      let particleTimeout: NodeJS.Timeout | null = null;
      const scheduleNextParticle = () => {
          if (particleTimeout) clearTimeout(particleTimeout);
          particleTimeout = setTimeout(() => {
              if (dataParticlesRef.current.length < 30 && sceneRef.current) { // Lower max
                 // Prioritize interconnect lines for spawning
                 let lineInfo: LineInfo | undefined;
                 const interconnectLines = allLinesRef.current.filter(l => l.type === 'interconnect');
                 const coreLines = allLinesRef.current.filter(l => l.type === 'core');

                 if (interconnectLines.length > 0 && Math.random() < 0.9) { // 90% chance interconnect
                     lineInfo = interconnectLines[Math.floor(Math.random() * interconnectLines.length)];
                 } else if (coreLines.length > 0) { // 10% chance core
                     lineInfo = coreLines[Math.floor(Math.random() * coreLines.length)];
                 }
                 
                 if (lineInfo) {
                    // ... (segment picking and particle creation logic - same as init) ...
                    const geometry = lineInfo.lineSegments.geometry;
                    const positions = geometry.attributes.position.array;
                    const numSegments = positions.length / 6;
                    if (numSegments > 0) {
                       const segmentIndex = Math.floor(Math.random() * numSegments);
                       const startIndex = segmentIndex * 6;
                       const segmentPoints = [ new THREE.Vector3(positions[startIndex], positions[startIndex+1], positions[startIndex+2]), new THREE.Vector3(positions[startIndex+3], positions[startIndex+4], positions[startIndex+5]) ];
                       const segmentGeometry = new THREE.BufferGeometry().setFromPoints(segmentPoints);
                       const tempLine = new THREE.Line(segmentGeometry, new THREE.LineBasicMaterial());
                       const particle = createDataParticle(tempLine, lineInfo.color || 0xffffff, sceneRef.current, lineInfo.type);
                       dataParticlesRef.current.push(particle);
                       segmentGeometry.dispose();
                    }
                 }
              }
              scheduleNextParticle(); 
          }, 200 + Math.random() * 500); // Spawn rate
      };
      scheduleNextParticle(); 
      
      const cleanupFunc = () => {
          if (particleTimeout) clearTimeout(particleTimeout);
      };
      return cleanupFunc; 
    }

    const cleanupParticles = init();

    // --- Animate Function (Updated Particle Logic) ---
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !camera) return; 
      
      // Apply smooth rotation to the group
      if (groupRef.current) {
          const targetRotationX = rotationRef.current.x;
          const targetRotationY = rotationRef.current.y;
          groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
          groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      }
      
      // Apply smooth zoom (Original Logic)
      camera.position.z += (targetZ - camera.position.z) * 0.05; 
      // Removed panning logic and camera.lookAt

      // --- Node Pulsing Animation (Subtler) ---
      const time = Date.now() * 0.001;
      const pulseFactor = 0.1; // Reduced intensity
      const pulseSpeed = 1.2; // Slightly slower 
      coreNodeMeshesRef.current.forEach((mesh, index) => {
          const scale = 1.0 + Math.sin(time * pulseSpeed + index * 0.5) * pulseFactor;
          mesh.scale.set(scale, scale, scale);
      });
      peripheralNodeMeshesRef.current.flat().forEach((mesh, index) => { 
          const scale = 1.0 + Math.sin(time * pulseSpeed * 0.8 + index * 0.8) * pulseFactor * 0.7;
          mesh.scale.set(scale, scale, scale);
      });
      
      // Subtle rotation for the starfield (separate from group)
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00005; 
        starsRef.current.rotation.x += 0.00002;
      }
      
      // --- Update Data Particles (Bi-directional) ---
      const particlesToRemove: number[] = [];
      dataParticlesRef.current.forEach((particle, index) => {
        // Update progress based on direction
        particle.progress += particle.speed * particle.direction;

        // Check boundaries and reverse direction or decrease life
        if (particle.progress >= 1) {
          particle.progress = 1; // Clamp
          particle.direction = -1; // Reverse
          particle.life -= 0.5; // Decrement life after reaching end
        } else if (particle.progress <= 0) {
          particle.progress = 0; // Clamp
          particle.direction = 1; // Reverse
          particle.life -= 0.5; // Decrement life after reaching start
        }

        // Remove particle if life runs out
        if (particle.life <= 0) {
          sceneRef.current?.remove(particle.mesh);
          particle.mesh.geometry.dispose();
          (particle.mesh.material as THREE.Material).dispose();
          particlesToRemove.push(index);
        } else {
          // Interpolate position along the segment
          particle.mesh.position.lerpVectors(particle.startPoint, particle.endPoint, particle.progress);
        }
      });
      
      // Remove particles marked for removal (iterate backwards)
      for (let i = particlesToRemove.length - 1; i >= 0; i--) {
          dataParticlesRef.current.splice(particlesToRemove[i], 1);
      }
      
      frameRef.current++;
      rendererRef.current.render(scene, camera);
    }

    // Add Original Event Listeners 
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove); // Keep on window for better drag capture
    window.addEventListener('mouseup', onMouseUp);     // Keep on window
    container.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onWindowResize);

    gsap.ticker.add(animate);

    // --- Return Cleanup Function ---
    return () => {
      gsap.ticker.remove(animate);
      // Remove Original Event Listeners
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onWindowResize);
      
      cleanupParticles?.();
      
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

      // Clear mesh refs
      coreNodeMeshesRef.current = [];
      peripheralNodeMeshesRef.current = [];
      allLinesRef.current = []; 
      dataParticlesRef.current = [];
      sceneRef.current = null;
      
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
    <div ref={containerRef} className="fixed inset-0 z-0" style={{ cursor: 'default' }}>
      {children}
    </div>
  )
} 