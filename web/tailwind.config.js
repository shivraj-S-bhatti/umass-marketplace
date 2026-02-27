/** @type {import('tailwindcss').Config} */
// Tailwind – Swiss design, dark mode
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			brand: ['Crimson Pro', 'Georgia', 'serif'],
  			graduate: ['Graduate', 'Georgia', 'serif'],
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
		ring: 'var(--ring)',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'var(--primary)',
				foreground: 'var(--primary-foreground)',
				hover: 'var(--primary-hover)',
				pressed: 'var(--primary-pressed)',
			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'oklch(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
		accent: {
				DEFAULT: 'var(--accent)',
				foreground: 'var(--accent-foreground)',
			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			surface: {
  				'1': 'hsl(var(--surface-1))',
  				'2': 'hsl(var(--surface-2))',
  				'3': 'hsl(var(--surface-3))'
  			},
  			brand: {
				'300': 'var(--ring)',
				'400': 'var(--primary)',
				'500': 'var(--primary-hover)',
				'600': 'var(--primary-pressed)',
			},
  			success: 'oklch(var(--success))',
  			warning: 'oklch(var(--warning))',
  			danger: 'oklch(var(--danger))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  		},
		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			'fade-in': {
				from: {
					opacity: '0'
				},
				to: {
					opacity: '1'
				}
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.3s ease-in'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
