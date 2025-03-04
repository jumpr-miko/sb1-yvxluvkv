/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0e1116',
        foreground: '#f8f9fa',
        primary: '#3b82f6',
        secondary: '#1e293b',
        accent: '#4f46e5',
        border: '#2d3748',
        'bolt-blue': '#3b82f6', // Reverted back to original blue for better visibility
        'bolt-indigo': '#4f46e5',
        'bolt-dark': '#0e1116',
        'bolt-gray': '#1e293b',
        'bolt-light': '#f8f9fa',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};