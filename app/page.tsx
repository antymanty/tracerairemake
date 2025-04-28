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
  // Initialize loading based on sessionStorage
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasLoaded = sessionStorage.getItem('hasLoadedOnce') === 'true';
      // console.log('[Home Init] Has loaded once?:', hasLoaded);
      return !hasLoaded; // True if flag NOT 'true'
    }
    return true; // Default to true if window is not available (SSR)
  });
  // Initialize showHero based on sessionStorage too
  const [showHero, setShowHero] = useState(() => {
      if (typeof window !== 'undefined') {
          const hasLoaded = sessionStorage.getItem('hasLoadedOnce') === 'true';
          // console.log('[Home Init] Show Hero initially?:', hasLoaded);
          return hasLoaded;
      }
      return false;
  }); 
  
  // New states to track loader completion and minimum time
  const [isLoaderInternallyComplete, setIsLoaderInternallyComplete] = useState(false);
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);

  // console.log('[Home Render] Initial states - loading:', loading, 'showHero:', showHero);

  // Effect for minimum load time
  useEffect(() => {
    // If already loaded (from sessionStorage), bypass min time check
    if (sessionStorage.getItem('hasLoadedOnce') === 'true') {
        setIsMinTimeElapsed(true);
        return;
    }

    const timer = setTimeout(() => {
      // console.log('[Home MinTime Effect] Min time elapsed.');
      setIsMinTimeElapsed(true);
    }, 200); // 200ms minimum time

    return () => clearTimeout(timer); 
  }, []); // Run only once on mount

  // Effect to set loading to false when BOTH conditions are met
  useEffect(() => {
    // console.log(`[Home Combine Effect] Checking conditions: minTime=${isMinTimeElapsed}, loaderComplete=${isLoaderInternallyComplete}`);
    if (isMinTimeElapsed && isLoaderInternallyComplete) {
      // console.log('[Home Combine Effect] Both conditions met, setting loading to false.');
      // Only set loading to false if it's currently true
      setLoading(currentLoading => {
          if (currentLoading) {
              return false;
          }
          return currentLoading; // Keep it false if already false
      });
    }
  }, [isMinTimeElapsed, isLoaderInternallyComplete]);

  // Function to be called when loader signals internal completion
  const handleLoadingComplete = () => {
    // console.log('[Home handleLoadingComplete] Loader internal complete.');
    setIsLoaderInternallyComplete(true);
  };

  // Function to be called when loader fade finishes
  const handleFadeComplete = () => {
    // console.log('[Home handleFadeComplete] Fade complete! Setting showHero and sessionStorage.');
    setShowHero(true);
    // Set the flag in sessionStorage only AFTER the fade is complete
    // and only if it wasn't already set (handles the initial load case)
    if (sessionStorage.getItem('hasLoadedOnce') !== 'true') {
        sessionStorage.setItem('hasLoadedOnce', 'true');
    }
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
