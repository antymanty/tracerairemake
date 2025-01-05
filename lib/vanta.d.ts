declare module 'vanta/dist/vanta.halo.min' {
  interface VantaHaloOptions {
    el: HTMLElement | null
    THREE: typeof THREE
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    minHeight?: number
    minWidth?: number
    baseColor?: number
    backgroundColor?: number
    amplitudeFactor?: number
    size?: number
    xOffset?: number
    yOffset?: number
  }

  function HALO(options: VantaHaloOptions): {
    setOptions: (options: Partial<VantaHaloOptions>) => void
    resize: () => void
    destroy: () => void
  }

  export default HALO
} 