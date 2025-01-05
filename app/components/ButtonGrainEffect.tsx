'use client'

export default function ButtonGrainEffect() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
      style={{
        maskImage: 'linear-gradient(to bottom, black, black)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, black)'
      }}
    >
      <div 
        className="absolute inset-[-100%] opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'animateGrain 8s steps(10) infinite'
        }}
      />
    </div>
  )
} 