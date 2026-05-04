module.exports = {
  content: ['./index.html', './404.html', './script.js'],
  safelist: [
    'md:col-span-3',
    'md:col-span-4',
    'md:col-span-5',
    'md:col-span-7',
    'md:row-span-2',
    'md:row-span-3',
    'md:row-span-4',
    'bg-accent/90',
    'text-black',
    'bg-black/55',
    'text-cream',
    'border',
    'border-white/10',
    'cursor-pointer',
    'text-left',
    'transition',
    'hover:-translate-y-0.5'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif']
      },
      colors: {
        cream: '#f4f0e8',
        accent: '#ccb07a'
      },
      boxShadow: {
        luxe: '0 26px 80px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
};
