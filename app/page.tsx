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
  // Initialize state matching server render (loading=true, showHero=false)
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(false); 
  
  // States to track loader completion and minimum time
  const [isLoaderInternallyComplete, setIsLoaderInternallyComplete] = useState(false);
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);

  // Effect to check sessionStorage AFTER mount and hydration
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('hasLoadedOnce') === 'true';
    // console.log('[Home Mount Effect] Checking sessionStorage. hasLoadedOnce:', hasLoaded);
    if (hasLoaded) {
      // console.log('[Home Mount Effect] Skipping loader.');
      setLoading(false);
      setShowHero(true);
      // Ensure other states are also bypassed if skipping loader
      setIsMinTimeElapsed(true);
      setIsLoaderInternallyComplete(true);
    }
  }, []); // Run only once after initial mount

  // Effect for minimum load time (only runs if not skipping loader)
  useEffect(() => {
    // If already loaded (flag found in mount effect), do nothing.
    if (sessionStorage.getItem('hasLoadedOnce') === 'true') {
        return;
    }
    // console.log('[Home MinTime Effect] Starting min time timer.');
    const timer = setTimeout(() => {
      // console.log('[Home MinTime Effect] Min time elapsed.');
      setIsMinTimeElapsed(true);
    }, 200); // 200ms minimum time

    return () => clearTimeout(timer); 
  }, []); // Run only once on mount

  // Effect to set loading to false when BOTH conditions are met
  useEffect(() => {
    // console.log(`[Home Combine Effect] Checking conditions: minTime=${isMinTimeElapsed}, loaderComplete=${isLoaderInternallyComplete}`);
    // Only proceed if loading is actually true (don't run if skipped via sessionStorage)
    if (loading && isMinTimeElapsed && isLoaderInternallyComplete) {
      // console.log('[Home Combine Effect] Both conditions met, setting loading to false.');
      setLoading(false);
    }
  }, [loading, isMinTimeElapsed, isLoaderInternallyComplete]); // Rerun when dependencies change

  // Function to be called when loader signals internal completion
  const handleLoadingComplete = () => {
    // console.log('[Home handleLoadingComplete] Loader internal complete.');
    setIsLoaderInternallyComplete(true);
  };

  // Function to be called when loader fade finishes
  const handleFadeComplete = () => {
    // console.log('[Home handleFadeComplete] Fade complete! Setting showHero and sessionStorage after small delay.');
    // Add a small delay before showing Hero to smooth transition
    setTimeout(() => {
        setShowHero(true);
        // Set the flag in sessionStorage only AFTER the fade is complete
        // and only if it wasn't already set (handles the initial load case)
        if (sessionStorage.getItem('hasLoadedOnce') !== 'true') {
            sessionStorage.setItem('hasLoadedOnce', 'true');
        }
    }, 50); // 50ms delay
  };

  // console.log('[Home Render] Rendering - loading:', loading, 'showHero:', showHero);

  return (
    <main className="bg-black min-h-screen">
      {/* Render loader based on loading state */} 
      {loading && (
        <CellsLoader 
          onLoadingComplete={handleLoadingComplete} // Use the new handler
          onFadeComplete={handleFadeComplete} 
        />
      )}
      {/* Render Hero only when showHero is true */} 
      {showHero && <Hero />}
    </main>
  )
}
