module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          2: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
          3: 'rgb(var(--ink-3-rgb) / <alpha-value>)',
        },
        divider: {
          DEFAULT: 'rgb(var(--divider-rgb) / <alpha-value>)',
          warm: 'rgb(var(--divider-warm-rgb) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft-rgb) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        ghost: {
          DEFAULT: '#A0A4AD',
          soft: '#E3E6EC',
          deep: '#6F757F',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft-rgb) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info-rgb) / <alpha-value>)',
          soft: 'rgb(var(--info-soft-rgb) / <alpha-value>)',
        },
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
        warning: 'rgb(var(--accent-rgb) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--ink-3-rgb) / <alpha-value>)',
        },

        paper: {
          DEFAULT: 'rgb(var(--paper-rgb) / <alpha-value>)',
          edge: 'rgb(var(--paper-edge-rgb) / <alpha-value>)',
          rule: 'rgb(var(--paper-rule-rgb) / <alpha-value>)',
        },
        'r-ink': {
          DEFAULT: 'rgb(var(--r-ink-rgb) / <alpha-value>)',
          2: 'rgb(var(--r-ink-2-rgb) / <alpha-value>)',
        },
        'r-brown': 'rgb(var(--r-brown-rgb) / <alpha-value>)',
        'stamp-red': 'rgb(var(--stamp-red-rgb) / <alpha-value>)',
        'stamp-green': 'rgb(var(--stamp-green-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.14em',
        label: '0.1em',
        stamp: '0.12em',
        tight: '-0.01em',
        tighter: '-0.015em',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        receipt: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      maxWidth: {
        prose: '68ch',
        measure: '60ch',
        content: '1280px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
