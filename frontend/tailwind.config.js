/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ff4500',
          700: '#ea580c',
          800: '#c2410c',
          900: '#7c2d12',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0f1419',
        },
        sidebar: '#1a1a2e',
        sidebarAlt: '#16213e',
      },
      fonts: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      height: {
        'navbar': '64px',
      },
      spacing: {
        'navbar-height': '64px',
      },
      boxShadow: {
        'navbar': '0 2px 8px rgba(0,0,0,0.15)',
        'card': '0 2px 12px rgba(0,0,0,0.1)',
        'elevation': '0 4px 16px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
