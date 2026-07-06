/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14130f',
          950: '#0b0a08',
          900: '#14130f',
          800: '#211f19',
          700: '#332f27',
        },
        cream: {
          DEFAULT: '#f7f4ee',
          50: '#fdfcfa',
          100: '#f7f4ee',
          200: '#efe9dd',
          300: '#e2d9c6',
        },
        brass: {
          DEFAULT: '#c9a469',
          50: '#f8f0e2',
          100: '#efdcb9',
          200: '#ddc08a',
          300: '#c9a469',
          400: '#b0894f',
          500: '#8f6d3d',
          600: '#6e5330',
        },
      },
      fontFamily: {
        sans: ['"Roboto"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '700',
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.3em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      maxWidth: {
        content: '1440px',
      },
    },
  },
  plugins: [],
}
