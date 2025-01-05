'use client'

import { useState } from 'react'
import Hero from '@/app/components/Hero'
import ParticlePreloader from '@/app/components/ParticlePreloader'

export default function Home() {
  const [loading, setLoading] = useState(true)

  return (
    <main>
      {loading ? (
        <ParticlePreloader onLoadingComplete={() => setLoading(false)} />
      ) : (
        <Hero />
      )}
    </main>
  )
}
