'use client'

import { useState } from 'react'
import Hero from '@/app/components/Hero'
import CellsLoader from '@/app/components/CellsLoader'

export default function Home() {
  const [loading, setLoading] = useState(true)

  return (
    <main className="bg-black">
      {loading ? (
        <CellsLoader onLoadingComplete={() => setLoading(false)} />
      ) : (
        <Hero />
      )}
    </main>
  )
}
