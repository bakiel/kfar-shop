import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Premium Font System
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'var(--font-hebrew)', 'system-ui', 'sans-serif'],
        hebrew: ['var(--font-hebrew)', 'var(--font-body)', 'sans-serif'],
        accent: ['var(--font-accent)', 'var(--font-body)', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-hebrew)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // === CANONICAL BRAND PALETTE (Language 1: App UI — warm/functional) ===
        // Use these tokens for all NEW components.
        'kfar-green-deep': '#2D5A27',   // primary brand, headers, CTAs
        'kfar-green-ink': '#1E3D1A',    // darker — brand strip, bottom nav, footer
        'kfar-gold-premium': '#C4A265', // editorial accent (posters, premium cards)
        'kfar-amber': '#E8B84D',        // promo bar, pill badges, accent highlights
        'kfar-cream': '#F5F0E8',        // secondary surface
        'kfar-warm-white': '#FDFBF7',   // primary surface

        // kfar-gold / kfar-mint retained (used in existing components)
        'kfar-gold': '#f6af0d',
        'kfar-gold-dark': '#e09b00',
        'kfar-mint': '#478c0b',
        'kfar-mint-dark': '#3a7209',

        // === LEGACY ALIASES ===
        // These names appear in existing components and must not be removed.
        // They point to the same hex values as the corresponding canonical tokens
        // so both the old class names and the new ones resolve identically.
        'leaf-green': '#478c0b',        // alias: kfar-mint
        'leaf-green-light': '#5ba00f',
        'leaf-green-dark': '#3a7209',   // alias: kfar-mint-dark
        'sun-gold': '#f6af0d',          // alias: kfar-gold
        'sun-gold-light': '#f8c547',
        'sun-gold-dark': '#e09b00',     // alias: kfar-gold-dark
        'earth-flame': '#c23c09',
        'earth-flame-light': '#d64a0c',
        'earth-flame-dark': '#a82f07',
        'cream-base': '#fef9ef',        // alias: kfar-cream (lighter variant)
        'soil-brown': '#3a3a1d',
        'herbal-mint': '#cfe7c1',
      },
      scale: {
        '102': '1.02',
      },
      borderWidth: {
        '3': '3px',
      },
      // Premium Animation System
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(71, 140, 11, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(71, 140, 11, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      // Premium Shadow System
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'glow-green': '0 0 20px rgba(71, 140, 11, 0.3)',
        'glow-gold': '0 0 20px rgba(246, 175, 13, 0.3)',
        'glow-flame': '0 0 20px rgba(194, 60, 9, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
