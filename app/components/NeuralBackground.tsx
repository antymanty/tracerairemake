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
  nodeCount: 18,
  radius: 70,    
  colors: ['#FF66FF', '#FF9933', '#66FF66', '#FFFF66', '#66B2FF', '#FF6666'],
  connectionDistance: 90,
  connectionProbability: 0.12,
  coreConnectionProbability: 0.003, // Drastically reduced from previous 0.008 value
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
  const lastFlashTimeRef = useRef(0);
  const flashCooldown = 3000; // Minimum ms between flashes
  const flashChance = 0.005; // Chance per frame to initiate a flash

  // MODIFIED createDataParticle: Re-introduce source/destination color logic
  const createDataParticle = useCallback((
    lineSegment: [THREE.Vector3, THREE.Vector3],
    color: string | number,
    lineType: LineInfo['type'],
    sourceColor: string | number, // Parameter restored
    destinationColor: string | number // Parameter restored
  ) => {
    // Use the same design as nodes but slightly smaller (80% of node size)
    const nodeSize = lineType === 'interconnect' ? 
                     PERIPHERAL_CONFIG.nodeSize * 0.8 :
                     CORE_CONFIG.nodeSize * 0.8;
    
    // Create geometry the same as nodes
    const geometry = new THREE.SphereGeometry(nodeSize / 2, 8, 6);
    
    // Determine color based on source/destination
    let nodeColor: THREE.Color;
    
    if (lineType === 'interconnect') {
      // For interconnects, use the peripheral color (non-core color)
      const coreColorStr = new THREE.Color(CORE_CONFIG.color).getHexString();
      const sourceColorStr = new THREE.Color(sourceColor).getHexString();
      
      if (sourceColorStr === coreColorStr) {
        // If source is core, use destination color (peripheral)
        nodeColor = new THREE.Color(destinationColor);
      } else {
        // If source is peripheral, use its color
        nodeColor = new THREE.Color(sourceColor);
      }
    } else {
      // For core lines and peripheral lines
      nodeColor = new THREE.Color(color);
    }
    
    // Match the node material properties exactly
    const material = new THREE.MeshBasicMaterial({
      color: nodeColor,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create the particle
    const mesh = new THREE.Mesh(geometry, material);
    
    const startPoint = lineSegment[0];
    const endPoint = lineSegment[1];
    const initialProgress = 0;
    mesh.position.copy(startPoint);
    
    // Add to the group for proper rotation
    groupRef.current?.add(mesh);

    // Restore interconnect speed factor adjustment
    let speedFactor = 0.4 + Math.random() * 0.8;
    if (lineType === 'core') speedFactor *= 0.8 + Math.random() * 0.4;
    if (lineType === 'interconnect') speedFactor *= 0.7 + Math.random() * 0.6; // Restore interconnect speed factor

    return {
      mesh,
      startPoint,
      endPoint,
      progress: initialProgress,
      speed: (0.01 + Math.random() * 0.02) * speedFactor,
      direction: 1 as 1 | -1,
      life: 1 + Math.floor(Math.random() * 3),
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
      const generateLinesFromMeshes = (nodes1: THREE.Mesh[], nodes2: THREE.Mesh[], maxDistance: number, probability: number, lineType: LineInfo['type'], baseColor: string | number): LineInfo => {
        // Create BufferGeometry for lines with colors
        const positions: number[] = [];
        const colors: number[] = [];
        const singleGroup = nodes1 === nodes2;
        
        // Convert base color to THREE.Color for gradient calculations
        const baseColorObj = new THREE.Color(baseColor);
        // Get HSL values for creating gradients
        const hsl = { h: 0, s: 0, l: 0 };
        baseColorObj.getHSL(hsl);
        
        // Create a slightly different color for the gradient ends
        const endColorObj = new THREE.Color().setHSL(
          hsl.h,
          Math.max(0, hsl.s - 0.2), // Slightly less saturated 
          Math.min(1, hsl.l + 0.2)  // Slightly brighter
        );

        // First pass: ensure each node has at least one connection
        // Keep track of nodes that have been connected
        const connectedNodes1 = new Set<number>();
        const connectedNodes2 = singleGroup ? connectedNodes1 : new Set<number>();

        // Function to add a connection between two nodes
        const addConnection = (i: number, j: number) => {
          const p1 = nodes1[i].position;
          const p2 = nodes2[j].position;
          
          // Add line segment points
          positions.push(p1.x, p1.y, p1.z);
          positions.push(p2.x, p2.y, p2.z);
          
          // Add colors for gradient effect (start and end points have different colors)
          if (lineType === 'interconnect') {
            // For interconnects, create a gradient from core to periphery
            colors.push(baseColorObj.r, baseColorObj.g, baseColorObj.b);
            colors.push(endColorObj.r, endColorObj.g, endColorObj.b);
          } else {
            // For other lines, create a subtle gradient along the line
            colors.push(baseColorObj.r, baseColorObj.g, baseColorObj.b);
            colors.push(baseColorObj.r * 0.9, baseColorObj.g * 0.9, baseColorObj.b * 0.9);
          }
          
          // Mark nodes as connected
          connectedNodes1.add(i);
          connectedNodes2.add(j);
        };

        // First pass: ensure each node in nodes1 has at least one connection
        for (let i = 0; i < nodes1.length; i++) {
          if (connectedNodes1.has(i)) continue; // Already connected

          // Find closest node within maxDistance
          let closestIdx = -1;
          let closestDist = Infinity;
          
          const startJ = singleGroup ? i + 1 : 0; // Avoid self-connections in single group
          
          for (let j = startJ; j < nodes2.length; j++) {
            if (singleGroup && i === j) continue; // Skip self
            
            const p1 = nodes1[i].position;
            const p2 = nodes2[j].position;
            const distance = p1.distanceTo(p2);
            
            if (distance < maxDistance && distance < closestDist) {
              closestDist = distance;
              closestIdx = j;
            }
          }
          
          // If found a connection, add it
          if (closestIdx >= 0) {
            addConnection(i, closestIdx);
          }
        }

        // If using two different groups, ensure nodes2 are also connected
        if (!singleGroup) {
          for (let j = 0; j < nodes2.length; j++) {
            if (connectedNodes2.has(j)) continue; // Already connected
            
            // Find closest node from nodes1
            let closestIdx = -1;
            let closestDist = Infinity;
            
            for (let i = 0; i < nodes1.length; i++) {
              const p1 = nodes1[i].position;
              const p2 = nodes2[j].position;
              const distance = p1.distanceTo(p2);
              
              if (distance < maxDistance && distance < closestDist) {
                closestDist = distance;
                closestIdx = i;
              }
            }
            
            // If found a connection, add it
            if (closestIdx >= 0) {
              addConnection(closestIdx, j);
            }
          }
        }

        // Second pass: add random additional connections based on probability
        for (let i = 0; i < nodes1.length; i++) {
          const startJ = singleGroup ? i + 1 : 0; // Avoid self-connections and duplicates
          for (let j = startJ; j < nodes2.length; j++) {
            // Skip existing connections (this check is approximate for performance reasons)
            if (singleGroup && (i === j)) continue;
            
            // Generate additional random connections
            if (Math.random() > (1 - probability)) {
              const p1 = nodes1[i].position;
              const p2 = nodes2[j].position;
              const distance = p1.distanceTo(p2);

              if (distance < maxDistance) {
                // Check if this exact connection already exists
                // This is a simplified check that doesn't catch all duplicates but is efficient
                let exists = false;
                for (let k = 0; k < positions.length; k += 6) {
                  if ((positions[k] === p1.x && positions[k+1] === p1.y && positions[k+2] === p1.z &&
                      positions[k+3] === p2.x && positions[k+4] === p2.y && positions[k+5] === p2.z) ||
                      (positions[k] === p2.x && positions[k+1] === p2.y && positions[k+2] === p2.z &&
                      positions[k+3] === p1.x && positions[k+4] === p1.y && positions[k+5] === p1.z)) {
                    exists = true;
                    break;
                  }
                }
                
                if (!exists) {
                  addConnection(i, j);
                }
              }
            }
          }
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Add morphing targets for animation
        if (positions.length > 0) {
          const morphPositions: number[] = [];
          // Copy original positions but add small random deviations for subtle animation
          for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Add subtle variation for the morph target
            // Note: Keep interconnect endpoints fixed and only morph midpoints
            if (i % 6 === 3 && lineType === 'interconnect') {
              // This is an end point of interconnect, keep it fixed
              morphPositions.push(x, y, z);
            } else {
              // Add subtle random movement
              const variation = lineType === 'core' ? 5 : 3;
              morphPositions.push(
                x + (Math.random() - 0.5) * variation,
                y + (Math.random() - 0.5) * variation,
                z + (Math.random() - 0.5) * variation
              );
            }
          }
          
          const morphTarget = new THREE.Float32BufferAttribute(morphPositions, 3);
          morphTarget.name = 'target1';
          geometry.morphAttributes.position = [morphTarget];
        }
        
        // Create a material with vertex colors and transparency
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            // Make lines less visible overall, especially core lines
            opacity: lineType === 'core' ? 0.15 : 
                     lineType === 'interconnect' ? 0.15 : 0.3, // Lower opacity for core and interconnect
            blending: THREE.AdditiveBlending,
            linewidth: 1,
        });
        
        const lineSegments = new THREE.LineSegments(geometry, material);
        return { lineSegments, type: lineType, color: baseColor };
    };
      
      // --- Create Core Nodes (as Meshes) ---
      const coreCenter = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
      coreNodeMeshesRef.current = generateNodeMeshes(CORE_CONFIG.nodeCount, coreCenter, CORE_CONFIG.radius, CORE_CONFIG.color, CORE_CONFIG.nodeSize);
      coreNodeMeshesRef.current.forEach(mesh => groupRef.current?.add(mesh));

      // --- Create Core Lines (using Meshes) ---
      const coreLineInfo = generateLinesFromMeshes(
          coreNodeMeshesRef.current, 
          coreNodeMeshesRef.current, 
          CORE_CONFIG.connectionDistance, 
          CORE_CONFIG.connectionProbability,
          'core',
          CORE_CONFIG.color
      );
      groupRef.current?.add(coreLineInfo.lineSegments);
      allLinesRef.current.push(coreLineInfo);

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
        const periLineInfo = generateLinesFromMeshes(
            currentPeripheralMeshes, 
            currentPeripheralMeshes, 
            PERIPHERAL_CONFIG.connectionDistance, 
            PERIPHERAL_CONFIG.connectionProbability,
            'peripheral',
            periColor
        );
        groupRef.current?.add(periLineInfo.lineSegments);
        allLinesRef.current.push(periLineInfo);
      }

      // --- Create Core-Peripheral Lines (More Selective Approach) ---
      // First make sure all peripheral clusters are properly connected internally
      for (let i = 0; i < peripheralNodeMeshesRef.current.length; i++) {
        const currentCluster = peripheralNodeMeshesRef.current[i];
        // Ensure good connectivity within each cluster
        const periLineInfo = generateLinesFromMeshes(
            currentCluster, 
            currentCluster, 
            PERIPHERAL_CONFIG.connectionDistance * 1.2, // Slightly increased connection distance within cluster
            PERIPHERAL_CONFIG.connectionProbability * 1.5, // Increase internal connectivity
            'peripheral',
            PERIPHERAL_CONFIG.colors[i % PERIPHERAL_CONFIG.colors.length]
        );
        groupRef.current?.add(periLineInfo.lineSegments);
        allLinesRef.current.push(periLineInfo);
      }

      // Then create limited interconnect lines from core to periphery
      // Select only a few representative nodes from each peripheral cluster
      const selectedPeripheralNodes: THREE.Mesh[] = [];
      peripheralNodeMeshesRef.current.forEach(clusterNodes => {
        // Select just 1-2 nodes from each cluster to connect to core (instead of all nodes)
        const nodesToConnect = Math.max(1, Math.floor(clusterNodes.length * 0.1)); // 10% of nodes or at least 1
        
        // Pick nodes that are closest to the core for more natural connections
        const corePosition = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
        
        // Sort nodes by distance to core
        const sortedByDistance = [...clusterNodes].sort((a, b) => 
          a.position.distanceTo(corePosition) - b.position.distanceTo(corePosition)
        );
        
        // Select the closest nodes
        for (let i = 0; i < nodesToConnect; i++) {
          selectedPeripheralNodes.push(sortedByDistance[i]);
        }
      });

      // Create interconnect lines only between core and selected peripheral nodes
      const cpLineInfo = generateLinesFromMeshes(
          coreNodeMeshesRef.current, 
          selectedPeripheralNodes,  // Use only selected nodes instead of all
          PERIPHERAL_CONFIG.distanceFromCore * 1.1, 
          PERIPHERAL_CONFIG.coreConnectionProbability * 0.4, // Further reduce density of interconnect lines
          'interconnect',
          0x667788 // Subtle blue-gray color
      );
      groupRef.current?.add(cpLineInfo.lineSegments);
      allLinesRef.current.push(cpLineInfo);

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

      // Initialize data particles (REVISED to use actual line segments)
      const initDataParticles = (count: number) => {
         if (!sceneRef.current || !groupRef.current) return;

         dataParticlesRef.current.forEach(particle => {
           groupRef.current?.remove(particle.mesh);
         });
         dataParticlesRef.current = [];
         
         // Include all line types again
         const interconnectLines = allLinesRef.current.filter(l => l.type === 'interconnect');
         const coreLines = allLinesRef.current.filter(l => l.type === 'core');
         const peripheralLines = allLinesRef.current.filter(l => l.type === 'peripheral');
         
         // Adjusted distribution
         const interconnectCount = Math.ceil(count * 0.4); // 40% interconnect
         const peripheralCount = Math.ceil(count * 0.3); // 30% peripheral
         const coreCount = count - interconnectCount - peripheralCount; // 30% core
         
         // Helper remains the same
         const extractLineSegments = (lineInfo: LineInfo): [THREE.Vector3, THREE.Vector3][] => {
           const segments: [THREE.Vector3, THREE.Vector3][] = [];
           const positions = lineInfo.lineSegments.geometry.attributes.position.array;
           
           for (let i = 0; i < positions.length; i += 6) {
             const start = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
             const end = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
             segments.push([start, end]);
           }
           
           return segments;
         };
         
         // Restore interconnect particle creation loop
         if (interconnectLines.length > 0) {
           let createdCount = 0;
           let attempts = 0;
           const maxAttempts = interconnectCount * 2;
           
           while (createdCount < interconnectCount && attempts < maxAttempts) {
             attempts++;
             const lineInfo = interconnectLines[Math.floor(Math.random() * interconnectLines.length)];
             const segments = extractLineSegments(lineInfo);
             if (segments.length > 0) {
               const segment = segments[Math.floor(Math.random() * segments.length)];
               const corePosition = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
               const startToCore = segment[0].distanceTo(corePosition);
               const endToCore = segment[1].distanceTo(corePosition);
               
               // Ensure line color is defined, default to gray for interconnect
               const lineColor = lineInfo.color || 0x667788;
               
               // Determine peripheral color based on closest peripheral node (more accurate)
               let closestPeripheralColor = lineColor; 
               let minDist = Infinity;
               peripheralNodeMeshesRef.current.forEach((cluster, clusterIndex) => {
                 cluster.forEach(node => {
                   const distToStart = node.position.distanceTo(segment[0]);
                   const distToEnd = node.position.distanceTo(segment[1]);
                   if (distToStart < minDist || distToEnd < minDist) {
                     minDist = Math.min(distToStart, distToEnd);
                     closestPeripheralColor = PERIPHERAL_CONFIG.colors[clusterIndex % PERIPHERAL_CONFIG.colors.length];
                   }
                 });
               });
               
               const particle = createDataParticle(
                 segment,
                 lineColor,
                 'interconnect',
                 startToCore < endToCore ? CORE_CONFIG.color : closestPeripheralColor,
                 startToCore < endToCore ? closestPeripheralColor : CORE_CONFIG.color
               );
               dataParticlesRef.current.push(particle);
               createdCount++;
             }
           }
         }
         
         // Core particle creation (ensure correct parameters are passed)
         if (coreLines.length > 0) {
           let createdCount = 0;
           let attempts = 0;
           const maxAttempts = coreCount * 2;
           while (createdCount < coreCount && attempts < maxAttempts) {
             attempts++;
             const lineInfo = coreLines[Math.floor(Math.random() * coreLines.length)];
             const segments = extractLineSegments(lineInfo);
             if (segments.length > 0) {
               const segment = segments[Math.floor(Math.random() * segments.length)];
               const lineColor = lineInfo.color || CORE_CONFIG.color;
               const particle = createDataParticle(
                 segment,
                 lineColor,
                 'core',
                 lineColor, // Source = line color
                 lineColor  // Destination = line color
               );
               dataParticlesRef.current.push(particle);
               createdCount++;
             }
           }
         }
         
         // Peripheral particle creation (ensure correct parameters are passed)
         if (peripheralLines.length > 0) {
           let createdCount = 0;
           let attempts = 0;
           const maxAttempts = peripheralCount * 2;
           while (createdCount < peripheralCount && attempts < maxAttempts) {
             attempts++;
             const lineInfo = peripheralLines[Math.floor(Math.random() * peripheralLines.length)];
             const segments = extractLineSegments(lineInfo);
             if (segments.length > 0) {
               const segment = segments[Math.floor(Math.random() * segments.length)];
               const lineColor = lineInfo.color || 0x888888; // Default peripheral color
               const particle = createDataParticle(
                 segment,
                 lineColor,
                 'peripheral',
                 lineColor, // Source = line color
                 lineColor  // Destination = line color
               );
               dataParticlesRef.current.push(particle);
               createdCount++;
             }
           }
         }
      };
      initDataParticles(25); // Increased from 15

      // --- Periodically Create New Particles (REVISED LOGIC) ---
      let particleTimeout: NodeJS.Timeout | null = null;
      const scheduleNextParticle = () => {
          if (particleTimeout) clearTimeout(particleTimeout);
          particleTimeout = setTimeout(() => {
              if (dataParticlesRef.current.length < 40 && groupRef.current) { // Keep current max particle count
                  // Re-introduce interconnect spawning
                  const interconnectLines = allLinesRef.current.filter(l => l.type === 'interconnect');
                  const coreLines = allLinesRef.current.filter(l => l.type === 'core');
                  const peripheralLines = allLinesRef.current.filter(l => l.type === 'peripheral');
                  
                  // Adjusted distribution: 40% interconnect, 30% peripheral, 30% core
                  const rand = Math.random();
                  let selectedLine;
                  let lineType: LineInfo['type'] = 'interconnect'; // Default to interconnect
                  
                  if (rand < 0.4 && interconnectLines.length > 0) {
                      selectedLine = interconnectLines[Math.floor(Math.random() * interconnectLines.length)];
                      lineType = 'interconnect';
                  } else if (rand < 0.7 && peripheralLines.length > 0) {
                      selectedLine = peripheralLines[Math.floor(Math.random() * peripheralLines.length)];
                      lineType = 'peripheral';
                  } else if (coreLines.length > 0) {
                      selectedLine = coreLines[Math.floor(Math.random() * coreLines.length)];
                      lineType = 'core';
                  } else { // Fallback logic
                      if (interconnectLines.length > 0) {
                          selectedLine = interconnectLines[Math.floor(Math.random() * interconnectLines.length)];
                          lineType = 'interconnect';
                      } else if (peripheralLines.length > 0) {
                          selectedLine = peripheralLines[Math.floor(Math.random() * peripheralLines.length)];
                          lineType = 'peripheral';
                      } else if (coreLines.length > 0) {
                          selectedLine = coreLines[Math.floor(Math.random() * coreLines.length)];
                          lineType = 'core';
                      } // No else needed here, selectedLine will remain null/undefined if all lists are empty
                  }
                  
                  if (selectedLine) {
                      const positions = selectedLine.lineSegments.geometry.attributes.position.array;
                      if (positions.length >= 6) {
                          const numSegments = positions.length / 6;
                          const segmentIndex = Math.floor(Math.random() * numSegments);
                          const i = segmentIndex * 6;
                          const start = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
                          const end = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
                          
                          const lineColor = selectedLine.color || (lineType === 'interconnect' ? 0x667788 : 0xffffff);
                          
                          if (lineType === 'interconnect') {
                              const corePosition = new THREE.Vector3(CORE_CONFIG.position.x, CORE_CONFIG.position.y, CORE_CONFIG.position.z);
                              const startToCore = start.distanceTo(corePosition);
                              const endToCore = end.distanceTo(corePosition);
                              
                              // Find closest peripheral color (same logic as init)
                              let closestPeripheralColor = lineColor;
                              let minDist = Infinity;
                              peripheralNodeMeshesRef.current.forEach((cluster, clusterIndex) => {
                                cluster.forEach(node => {
                                  const distToStart = node.position.distanceTo(start);
                                  const distToEnd = node.position.distanceTo(end);
                                  if (distToStart < minDist || distToEnd < minDist) {
                                    minDist = Math.min(distToStart, distToEnd);
                                    closestPeripheralColor = PERIPHERAL_CONFIG.colors[clusterIndex % PERIPHERAL_CONFIG.colors.length];
                                  }
                                });
                              });
                              
                              const particle = createDataParticle(
                                  [start, end],
                                  lineColor,
                                  lineType,
                                  startToCore < endToCore ? CORE_CONFIG.color : closestPeripheralColor,
                                  startToCore < endToCore ? closestPeripheralColor : CORE_CONFIG.color
                              );
                              dataParticlesRef.current.push(particle);
                          } else {
                              const particle = createDataParticle(
                                  [start, end],
                                  lineColor,
                                  lineType,
                                  lineColor,
                                  lineColor
                              );
                              dataParticlesRef.current.push(particle);
                          }
                      }
                  }
              }
              scheduleNextParticle();
          }, 300 + Math.random() * 800); // Keep existing spawn rate
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

      const time = Date.now();
      const elapsed = time * 0.001;

      // --- Node Pulsing Animation (Subtler) ---
      const pulseFactor = 0.1; // Reduced intensity
      const pulseSpeed = 1.2; // Slightly slower 
      coreNodeMeshesRef.current.forEach((mesh, index) => {
          const scale = 1.0 + Math.sin(elapsed * pulseSpeed + index * 0.5) * pulseFactor;
          mesh.scale.set(scale, scale, scale);
      });
      peripheralNodeMeshesRef.current.flat().forEach((mesh, index) => { 
          // Apply base pulsing unless currently flashing
          if (!mesh.userData.isFlashing) {
            const scale = 1.0 + Math.sin(elapsed * pulseSpeed * 0.8 + index * 0.8) * pulseFactor * 0.7;
            mesh.scale.set(scale, scale, scale);
          }
      });
      
      // --- NEW: Peripheral Node Flashing --- 
      if (time - lastFlashTimeRef.current > flashCooldown && Math.random() < flashChance) {
          const allPeripheralNodes = peripheralNodeMeshesRef.current.flat();
          if (allPeripheralNodes.length > 0) {
              // Select a random peripheral node to flash
              const nodeToFlash = allPeripheralNodes[Math.floor(Math.random() * allPeripheralNodes.length)];
              
              // Ensure it's not already flashing
              if (!nodeToFlash.userData.isFlashing) {
                  nodeToFlash.userData.isFlashing = true;
                  lastFlashTimeRef.current = time; // Reset cooldown timer
                  
                  const originalScale = nodeToFlash.scale.x; // Assuming uniform scale
                  const originalOpacity = (nodeToFlash.material as THREE.MeshBasicMaterial).opacity;
                  const flashMaterial = nodeToFlash.material as THREE.MeshBasicMaterial;
                  
                  // Flash animation: quickly scale up/brighten, then fade back
                  gsap.timeline({ 
                      onComplete: () => { 
                          nodeToFlash.userData.isFlashing = false; 
                          // Ensure scale/opacity are reset precisely
                          nodeToFlash.scale.set(originalScale, originalScale, originalScale);
                          flashMaterial.opacity = originalOpacity;
                      }
                  })
                  .to(nodeToFlash.scale, { x: originalScale * 2.5, y: originalScale * 2.5, z: originalScale * 2.5, duration: 0.15, ease: "power2.out" })
                  .to(flashMaterial, { opacity: 1.0, duration: 0.15 }, "<" ) // Brighten simultaneously
                  .to(nodeToFlash.scale, { x: originalScale, y: originalScale, z: originalScale, duration: 0.4, ease: "power2.in" }, ">0.1") // Fade back slightly delayed
                  .to(flashMaterial, { opacity: originalOpacity, duration: 0.4 }, "<"); // Fade opacity simultaneously
              }
          }
      }
      
      // Subtle rotation for the starfield (separate from group)
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.00005; 
        starsRef.current.rotation.x += 0.00002;
      }
      
      // --- Update Data Particles (Keep most logic intact) ---
      const particlesToRemove: number[] = [];
      dataParticlesRef.current.forEach((particle, index) => {
        // Update progress based on direction
        particle.progress += particle.speed * particle.direction;

        // Check boundaries and handle reversing/life
        if (particle.progress >= 1) {
          particle.progress = 1; // Clamp
          particle.direction = -1; // Reverse
          particle.life -= 0.5;
        } else if (particle.progress <= 0) {
          particle.progress = 0; // Clamp
          particle.direction = 1; // Reverse
          particle.life -= 0.5;
        }

        // Remove particle if life runs out
        if (particle.life <= 0) {
          // Remove from group instead of scene
          groupRef.current?.remove(particle.mesh);
          particle.mesh.geometry.dispose();
          (particle.mesh.material as THREE.Material).dispose();
          particlesToRemove.push(index);
        } else {
          // Interpolate position along the exact line segment
          particle.mesh.position.lerpVectors(particle.startPoint, particle.endPoint, particle.progress);
        }
      });
      
      // Remove particles marked for removal
      for (let i = particlesToRemove.length - 1; i >= 0; i--) {
          dataParticlesRef.current.splice(particlesToRemove[i], 1);
      }
      
      frameRef.current++;
      rendererRef.current.render(sceneRef.current, camera);

      // Add morphing animation for lines
      const lineMorphTime = Date.now() * 0.001; // Animation time variable
      allLinesRef.current.forEach(lineInfo => {
        if (lineInfo.lineSegments.morphTargetInfluences && lineInfo.lineSegments.morphTargetInfluences.length > 0) {
          // Create a smooth oscillation for the morph target influence
          const sinValue = Math.sin(lineMorphTime * 0.5 + Math.random() * 0.5);
          lineInfo.lineSegments.morphTargetInfluences[0] = Math.abs(sinValue) * 0.5; // Scale down the effect
        }
      });
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
  }, [createDataParticle]) // Dependency updated

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" style={{ cursor: 'default' }}>
      {children}
    </div>
  )
} 