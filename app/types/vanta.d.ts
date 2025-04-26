declare module 'vanta/dist/vanta.topology.min' {
  interface VantaOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaOptions>) => void;
    resize: () => void;
  }

  const VANTA: {
    TOPOLOGY: (options: VantaOptions) => VantaEffect;
  };
  
  export default VANTA;
}

declare module 'vanta/dist/vanta.net.min' {
  interface VantaNetOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaNetOptions>) => void;
    resize: () => void;
  }

  function NET(options: VantaNetOptions): VantaEffect;
  export default NET;
}

declare module 'vanta/dist/vanta.waves.min' {
  interface VantaWavesOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    shininess?: number;
    waveHeight?: number;
    waveSpeed?: number;
    zoom?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaWavesOptions>) => void;
    resize: () => void;
  }

  function WAVES(options: VantaWavesOptions): VantaEffect;
  export default WAVES;
}

declare module 'vanta/dist/vanta.cells.min' {
  interface VantaCellsOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color1?: number;
    color2?: number;
    size?: number;
    speed?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaCellsOptions>) => void;
    resize: () => void;
  }

  function CELLS(options: VantaCellsOptions): VantaEffect;
  export default CELLS;
}

declare module 'vanta/dist/vanta.fog.min' {
  interface VantaFogOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    highlightColor?: number;
    midtoneColor?: number;
    lowlightColor?: number;
    baseColor?: number;
    blurFactor?: number;
    speed?: number;
    zoom?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaFogOptions>) => void;
    resize: () => void;
  }

  function FOG(options: VantaFogOptions): VantaEffect;
  export default FOG;
}

declare module 'vanta/dist/vanta.globe.min' {
  interface VantaGlobeOptions {
    el: HTMLElement | null;
    THREE: typeof import('three');
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    color2?: number;
    backgroundColor?: number;
    size?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
  }

  interface VantaEffect {
    destroy: () => void;
    setOptions: (options: Partial<VantaGlobeOptions>) => void;
    resize: () => void;
  }

  function GLOBE(options: VantaGlobeOptions): VantaEffect;
  export default GLOBE;
} 