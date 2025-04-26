'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import VANTA from 'vanta/dist/vanta.topology.min'

interface TopologyBackgroundProps {
  children?: React.ReactNode
}

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

export default function TopologyBackground({ children }: TopologyBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      if (typeof window !== 'undefined') {
        window.THREE = THREE
      }
      
      setVantaEffect(
        VANTA.TOPOLOGY({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x3b82f6,
          backgroundColor: 0x000000,
        })
      )
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <div ref={vantaRef} className="absolute inset-0 z-0">
      {children}
    </div>
  )
} 