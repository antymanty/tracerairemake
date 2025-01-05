declare module '../vanta.halo.min.js' {
  import * as THREE from 'three'

  interface VantaHaloOptions {
    el: HTMLElement | null
    THREE: typeof THREE
    mouseControls: boolean
    touchControls: boolean
    gyroControls: boolean
    minHeight: number
    minWidth: number
    baseColor: number
    backgroundColor: number
    amplitudeFactor: number
    size: number
  }

  interface VantaHaloEffect {
    destroy: () => void
  }

  function HALO(options: VantaHaloOptions): VantaHaloEffect
  export default HALO
} 