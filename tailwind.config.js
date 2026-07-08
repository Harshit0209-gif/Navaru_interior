// Resolves to a CSS custom property at runtime instead of a fixed hex value,
// so these shades can be swapped for the admin dark theme (see index.css's
// `.admin-dark` scope) without touching every className in the app. Tailwind
// opacity modifiers (e.g. `text-ink-900/60`) still work because the variable
// stores space-separated RGB channels rather than a hex string.
function withOpacity(variable) {
  return ({ opacityValue }) =>
    opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          // 950 is deliberately a static hex, not a variable: it's used
          // throughout the app as a "guaranteed dark" color (modal
          // backdrops, the always-dark admin sidebar, hover-contrast text
          // on the brass accent) rather than adaptive foreground text, so
          // it must not flip in dark mode.
          950: '#0b0a08',
          DEFAULT: withOpacity('--color-ink-900'),
          900: withOpacity('--color-ink-900'),
          800: withOpacity('--color-ink-800'),
          700: withOpacity('--color-ink-700'),
        },
        cream: {
          DEFAULT: withOpacity('--color-cream-100'),
          50: withOpacity('--color-cream-50'),
          100: withOpacity('--color-cream-100'),
          200: withOpacity('--color-cream-200'),
          300: withOpacity('--color-cream-300'),
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
