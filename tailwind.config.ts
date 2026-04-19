import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
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
      padding: "2rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        /* ─── Semantic color channels ─── */
        brand: {
          50: 'hsl(var(--brand-50))',
          100: 'hsl(var(--brand-100))',
          200: 'hsl(var(--brand-200))',
          300: 'hsl(var(--brand-300))',
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
          600: 'hsl(var(--brand-600))',
          700: 'hsl(var(--brand-700))',
          800: 'hsl(var(--brand-800))',
          900: 'hsl(var(--brand-900))',
          DEFAULT: 'hsl(var(--color-brand))',
          foreground: 'hsl(var(--color-brand-foreground))',
        },
        coral: {
          50: 'hsl(var(--coral-50))',
          100: 'hsl(var(--coral-100))',
          200: 'hsl(var(--coral-200))',
          300: 'hsl(var(--coral-300))',
          400: 'hsl(var(--coral-400))',
          500: 'hsl(var(--coral-500))',
          600: 'hsl(var(--coral-600))',
          700: 'hsl(var(--coral-700))',
          800: 'hsl(var(--coral-800))',
          900: 'hsl(var(--coral-900))',
        },
        sun: {
          50: 'hsl(var(--sun-50))',
          100: 'hsl(var(--sun-100))',
          200: 'hsl(var(--sun-200))',
          300: 'hsl(var(--sun-300))',
          400: 'hsl(var(--sun-400))',
          500: 'hsl(var(--sun-500))',
          600: 'hsl(var(--sun-600))',
          700: 'hsl(var(--sun-700))',
          800: 'hsl(var(--sun-800))',
          900: 'hsl(var(--sun-900))',
        },
        sky: {
          500: 'hsl(var(--sky-500))',
        },
        ink: {
          50: 'hsl(var(--ink-50))',
          100: 'hsl(var(--ink-100))',
          200: 'hsl(var(--ink-200))',
          300: 'hsl(var(--ink-300))',
          400: 'hsl(var(--ink-400))',
          500: 'hsl(var(--ink-500))',
          600: 'hsl(var(--ink-600))',
          700: 'hsl(var(--ink-700))',
          800: 'hsl(var(--ink-800))',
          900: 'hsl(var(--ink-900))',
        },

        /* ─── Semantic tokens (single-source-of-truth) ─── */
        connection: {
          DEFAULT: 'hsl(var(--color-connection))',
          foreground: 'hsl(var(--color-connection-foreground))',
        },
        trust: {
          DEFAULT: 'hsl(var(--color-trust))',
          foreground: 'hsl(var(--color-trust-foreground))',
        },
        surface: {
          background: 'hsl(var(--surface-background))',
          elevated: 'hsl(var(--surface-elevated))',
          sunken: 'hsl(var(--surface-sunken))',
          border: 'hsl(var(--surface-border))',
        },

        /* ─── Shadcn/ui base colors (derive from tokens) ─── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'header': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      },
      spacing: {
        '4': '1rem',
        '4.5': '1.125rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '18': '4.5rem',
        '24': '6rem',
        '32': '8rem',
        '88': '22rem',
        '90': '22.5rem',
        '96': '24rem',
        '128': '32rem',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
