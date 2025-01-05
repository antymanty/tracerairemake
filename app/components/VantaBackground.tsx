'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import HALO from 'vanta/dist/vanta.halo.min'

interface VantaBackgroundProps {
    children: React.ReactNode
}

export default function VantaBackground({ children }: VantaBackgroundProps) {
    const [vantaEffect, setVantaEffect] = useState<ReturnType<typeof HALO> | null>(null)
    const vantaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                HALO({
                    backgroundColor: 0x000000,
                    size: 0.75,
                    amplitudeFactor: 1.0,
                    xOffset: 0.0,
                    yOffset: 0.0,
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 100.00,
                    minWidth: 100.00,
                })
            )
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy()
        }
    }, [vantaEffect])

    return (
        <div ref={vantaRef} className="fixed inset-0 z-0">
            {children}
        </div>
    )
} 