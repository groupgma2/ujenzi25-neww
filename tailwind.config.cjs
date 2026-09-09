module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ea6d32',
        'primary-light': '#f38d5a',
        'primary-dark': '#c85728',
        'primary-bg': '#fef7f0',
        'primary-border': '#fbd8c7',

        secondary: '#1a1a2e',
        'secondary-light': '#2d2d44',

        accent: '#00b4d8',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',

        bg: '#ffffff',
        'bg-secondary': '#fafafa',
        'bg-tertiary': '#f5f5f5',

        text: '#1f2937',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        'text-inverse': '#ffffff',

        border: '#e5e7eb',
        'border-light': '#f3f4f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
