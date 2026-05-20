/**
 * Air Quality Monitor — Tailwind Config
 *
 * Maps CSS variables (defined in tokens.css) to Tailwind utility classes.
 * This file is the public API for components: use `bg-canvas`, `text-primary`,
 * `accent-primary`, never raw hex values.
 *
 * Theme switching: see tokens.css and the JS bootstrap in index.html.
 * Dark mode: class-based, set on <html> by the bootstrap script.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class', // .dark applied on <html> by JS bootstrap

  theme: {
    extend: {
      colors: {
        /* Semantic backgrounds */
        canvas: 'var(--color-bg-canvas)',
        surface: 'var(--color-bg-surface)',
        subtle: 'var(--color-bg-subtle)',
        muted: 'var(--color-bg-muted)',
        inverse: 'var(--color-bg-inverse)',

        /* Text colors — namespaced */
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          link: 'var(--color-text-link)',
          'on-accent': 'var(--color-text-on-accent)',
        },

        /* Borders */
        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },

        /* Brand accents */
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          hover: 'var(--color-accent-primary-hover)',
          active: 'var(--color-accent-primary-active)',
          secondary: 'var(--color-accent-secondary)',
        },

        /* Status */
        success: 'var(--color-status-success)',
        warning: 'var(--color-status-warning)',
        error: 'var(--color-status-error)',
        info: 'var(--color-status-info)',

        /* Domain — air-quality sensors */
        sensor: {
          online: 'var(--color-sensor-online)',
          degraded: 'var(--color-sensor-degraded)',
          offline: 'var(--color-sensor-offline)',
        },

        /* Chart */
        chart: {
          bar: 'var(--color-chart-bar)',
          'bar-hover': 'var(--color-chart-bar-hover)',
          grid: 'var(--color-chart-grid)',
          axis: 'var(--color-chart-axis)',
        },

        /* Utility */
        overlay: 'var(--color-overlay)',
        skeleton: 'var(--color-skeleton)',
        'skeleton-highlight': 'var(--color-skeleton-highlight)',

        /* Raw ING palette (escape hatch — use only when semantic doesn't fit) */
        'ing-orange': {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFC8A8',
          300: '#FFA577',
          400: '#FF8542',
          500: '#FF7C24',
          600: '#FF6200',
          700: '#D24E00',
          800: '#A33D00',
          900: '#7A2D00',
          950: '#4D1C00',
        },
        'ing-navy': {
          50: '#F1F4F9',
          100: '#DDE4EE',
          200: '#BBC9DD',
          300: '#8FA4C2',
          400: '#6A82A6',
          500: '#4F6B91',
          600: '#3D5478',
          700: '#2A4768',
          800: '#1F3D75',
          900: '#102140',
          950: '#07142A',
        },
      },

      fontFamily: {
        sans: ['var(--font-family-ui)'],
        display: ['var(--font-family-display)'],
        mono: ['var(--font-family-mono)'],
      },

      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: '1rem' }], // 11/16
        sm: ['var(--font-size-sm)', { lineHeight: '1.125rem' }], // 12/18
        base: ['var(--font-size-base)', { lineHeight: '1.25rem' }], // 14/20
        md: ['var(--font-size-md)', { lineHeight: '1.5rem' }], // 16/24
        lg: ['var(--font-size-lg)', { lineHeight: '1.75rem' }], // 18/28
        xl: ['var(--font-size-xl)', { lineHeight: '1.75rem' }], // 20/28
        '2xl': ['var(--font-size-2xl)', { lineHeight: '2rem' }], // 24/32
        '3xl': ['var(--font-size-3xl)', { lineHeight: '2.25rem' }], // 30/36
        '4xl': ['var(--font-size-4xl)', { lineHeight: '2.5rem' }], // 36/40
      },

      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },

      lineHeight: {
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },

      letterSpacing: {
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
      },

      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
      },

      maxWidth: {
        prose: 'var(--max-width-prose)',
        container: 'var(--max-width-container)',
        wide: 'var(--max-width-wide)',
      },

      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      transitionTimingFunction: {
        DEFAULT: 'var(--easing-default)',
        in: 'var(--easing-in)',
        out: 'var(--easing-out)',
        emphasis: 'var(--easing-emphasis)',
      },

      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { backgroundColor: 'var(--color-skeleton)' },
          '50%': { backgroundColor: 'var(--color-skeleton-highlight)' },
        },
        'poll-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-up-fade': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Entrance for the centered desktop modal. The transform keeps the
        // translate(-50%,-50%) centering — animating bare translateY would
        // drop it for the animation's duration and the modal would snap.
        'modal-in': {
          from: { opacity: '0', transform: 'translate(-50%, -50%) translateY(6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) translateY(0) scale(1)' },
        },
        'sheet-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'sheet-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.6s ease-in-out infinite',
        'poll-pulse': 'poll-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in var(--duration-normal) var(--easing-out)',
        'fade-out': 'fade-out var(--duration-normal) var(--easing-in)',
        'slide-up-fade': 'slide-up-fade var(--duration-fast) var(--easing-out)',
        'modal-in': 'modal-in var(--duration-fast) var(--easing-out)',
        'sheet-in-right': 'sheet-in-right var(--duration-normal) var(--easing-out)',
        'sheet-out-right': 'sheet-out-right var(--duration-fast) var(--easing-in)',
      },
    },
  },

  plugins: [
    // Future: @tailwindcss/forms, @tailwindcss/container-queries
  ],
};

export default config;
