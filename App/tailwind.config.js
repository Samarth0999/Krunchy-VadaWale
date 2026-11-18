/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: 'rgb(var(--color-bg-base) / <alpha-value>)',
          900: 'rgb(var(--color-bg-card) / <alpha-value>)',
          850: 'rgb(var(--color-bg-elevated) / <alpha-value>)',
          800: 'rgb(var(--color-bg-hover) / <alpha-value>)',
          700: 'rgb(var(--color-border) / <alpha-value>)',
          600: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        krunchy: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'surface': 'var(--shadow-surface)',
      },
    },
  },
  plugins: [],
}
