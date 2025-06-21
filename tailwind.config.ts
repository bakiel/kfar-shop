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
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'kfar-gold': '#f6af0d',
        'kfar-gold-dark': '#e09b00',
        'kfar-mint': '#478c0b',
        'kfar-mint-dark': '#3a7209',
        'leaf-green': '#478c0b',
        'leaf-green-light': '#5ba00f',
        'leaf-green-dark': '#3a7209',
        'sun-gold': '#f6af0d',
        'sun-gold-light': '#f8c547',
        'sun-gold-dark': '#e09b00',
        'earth-flame': '#c23c09',
        'earth-flame-light': '#d64a0c',
        'earth-flame-dark': '#a82f07',
        'cream-base': '#fef9ef',
        'soil-brown': '#3a3a1d',
        'herbal-mint': '#cfe7c1',
      },
      scale: {
        '102': '1.02',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
} satisfies Config;
