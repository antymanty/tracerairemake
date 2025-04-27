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
    const minLoadTime = 200 // Reduced minimum load time to 200ms
    const startTime = Date.now()
    
    // This timeout ensures setLoading(false) doesn't happen *instantly*
    // giving the loader a moment to appear.
    const timer = setTimeout(() => {
         const elapsedTime = Date.now() - startTime
         if (!loading) { // Check if loading is already false (likely via onLoadingComplete)
             return;
         }
         if (elapsedTime >= minLoadTime) {
            setLoading(false);
         } else {
             // If onLoadingComplete finished early, wait remaining time
             setTimeout(() => setLoading(false), minLoadTime - elapsedTime);
         }
    }, minLoadTime); // Initial check after minLoadTime

    return () => clearTimeout(timer); // Cleanup timeout
  }, [loading]) // Dependency on loading prevents issues if onLoadingComplete fires first

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
