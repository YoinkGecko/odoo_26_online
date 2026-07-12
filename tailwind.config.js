/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep purple accent — used sparingly
        brand: {
          50: '#F5F0F7',
          100: '#EDE3F0',
          200: '#D9C7DF',
          300: '#B89FC1',
          400: '#8E6B9A',
          500: '#6D4D7B',
          600: '#5B3A6B',
          700: '#4A2E57',
          800: '#3C2647',
          900: '#2E1D38',
        },
        ink: {
          900: '#1A1A1A',
          800: '#262626',
          700: '#333333',
          600: '#4A4A4A',
          500: '#666666',
          400: '#888888',
          300: '#A8A8A8',
          200: '#C8C8C8',
          100: '#E0E0E0',
          50: '#F0F0F0',
        },
        canvas: '#FAFAFA',
        // Status badge fills (soft tints)
        success: { soft: '#E6F4EA', text: '#1E6B36', border: '#BFE3CD' },
        info: { soft: '#E8F0FB', text: '#18559A', border: '#C5DDF5' },
        warning: { soft: '#FBF3E0', text: '#8A5A00', border: '#F0DCA8' },
        danger: { soft: '#FBEAEA', text: '#9B2222', border: '#F2C5C5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};
