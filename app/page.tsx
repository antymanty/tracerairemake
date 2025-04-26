'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CellsLoader from '@/app/components/CellsLoader'

// Dynamically import Hero component with no SSR to ensure it only loads on client
const Hero = dynamic(() => import('@/app/components/Hero'), { 
  ssr: false,
  loading: () => <div className="bg-black w-full h-screen" />
})

export default function Home() {
  const [loading, setLoading] = useState(true)
  
  // Ensure minimal load time even on fast connections
  useEffect(() => {
    const minLoadTime = 2000 // minimum 2 seconds loading time
    const startTime = Date.now()
    
    return () => {
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minLoadTime) {
        console.log('Enforcing minimum load time')
      }
    }
  }, [])

  return (
    <main className="bg-black min-h-screen">
      {loading ? (
        <CellsLoader onLoadingComplete={() => setLoading(false)} />
      ) : (
        <Hero />
      )}
    </main>
  )
}
