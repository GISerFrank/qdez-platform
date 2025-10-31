/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        pixel: {
          bg: '#1a1a35',
          primary: '#4F46E5',
          secondary: '#7C3AED',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
        }
      },
      boxShadow: {
        pixel: '4px 4px 0 #000000',
        'pixel-lg': '8px 8px 0 rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
