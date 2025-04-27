import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    // Emerald
    'text-emerald-400', 'from-emerald-600', 'via-emerald-500', 'to-emerald-400', 'bg-emerald-400', 'border-emerald-400/30', 'bg-emerald-500/10',
    // Cyan
    'text-cyan-400', 'from-cyan-600', 'via-cyan-500', 'to-cyan-400', 'bg-cyan-400', 'border-cyan-400/30', 'bg-cyan-500/10',
    // Blue
    'text-blue-400', 'from-blue-600', 'via-blue-500', 'to-blue-400', 'bg-blue-400', 'border-blue-400/30', 'bg-blue-500/10',
    // Purple
    'text-purple-400', 'from-purple-600', 'via-purple-500', 'to-purple-400', 'bg-purple-400', 'border-purple-400/30', 'bg-purple-500/10',
    // Yellow
    'text-yellow-400', 'from-yellow-600', 'via-yellow-500', 'to-yellow-400', 'bg-yellow-400', 'border-yellow-400/30', 'bg-yellow-500/10',
    // Pink
    'text-pink-400', 'from-pink-600', 'via-pink-500', 'to-pink-400', 'bg-pink-400', 'border-pink-400/30', 'bg-pink-500/10',
    // Green
    'text-green-400', 'from-green-600', 'via-green-500', 'to-green-400', 'bg-green-400', 'border-green-400/30', 'bg-green-500/10',
    // Gray
    'text-gray-400', 'border-gray-400/30', 'bg-gray-500/10',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'color-1': 'hsl(var(--color-1))',
  			'color-2': 'hsl(var(--color-2))',
  			'color-3': 'hsl(var(--color-3))',
  			'color-4': 'hsl(var(--color-4))',
  			'color-5': 'hsl(var(--color-5))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			rainbow: 'rainbow var(--speed, 2s) infinite linear',
  			'star-movement-top': 'star-movement-top linear infinite alternate',
  			'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
  			'shine': 'shine 4s linear infinite',
  		},
  		keyframes: {
  			rainbow: {
  				'0%': {
  					'background-position': '0%'
  				},
  				'100%': {
  					'background-position': '200%'
  				}
  			},
  			'star-movement-top': {
  				'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
  				'100%': { transform: 'translate(100%, 0%)', opacity: '0' },
  			},
  			'star-movement-bottom': {
  				'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
  				'100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
  			},
  			'shine': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			},
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
