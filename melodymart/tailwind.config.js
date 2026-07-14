/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Melody Mart brand tokens ─────────────────── */
        mm: {
          ink:        '#09080C',
          graphite:   '#110F16',
          carbon:     '#1A1823',
          onyx:       '#231F2E',
          mist:       '#2E293C',
          line:       '#3A3447',
          gold:       '#D4A853',
          'gold-lt':  '#E8C47A',
          'gold-dk':  '#A8832A',
          copper:     '#C07B50',
          coral:      '#E07060',
          emerald:    '#38A882',
          teal:       '#2A9D9F',
          ivory:      '#F2EDE4',
          cream:      '#C8BFA8',
          sand:       '#8A8070',
          stone:      '#4A4558',
        },
        /* ── Legacy CSS-variable aliases ─────────────── */
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card: {
          DEFAULT:  'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT:  'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:  'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:  'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:  'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:  'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        'app-border': 'var(--border)',
        input:  'var(--input)',
        ring:   'var(--ring)',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg:   '1rem',
        md:   '0.75rem',
        sm:   '0.5rem',
        xl:   '1.25rem',
        '2xl':'1.5rem',
      },
      boxShadow: {
        gold:   '0 0 24px rgba(212,168,83,0.15), 0 8px 32px rgba(0,0,0,0.4)',
        'gold-lg': '0 0 40px rgba(212,168,83,0.2), 0 16px 48px rgba(0,0,0,0.5)',
        warm:   '0 8px 32px rgba(0,0,0,0.4)',
        'warm-lg': '0 20px 60px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #D4A853 0%, #C07B50 100%)',
        'dark-gradient':  'linear-gradient(135deg, #1A1823 0%, #231F2E 100%)',
        'music-gradient': 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(56,168,130,0.05) 100%)',
      },
      keyframes: {
        shimmer: {
          '0%':   { 'background-position': '-200% center' },
          '100%': { 'background-position':  '200% center' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)'   },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'waveform': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)'   },
        },
      },
      animation: {
        shimmer:    'shimmer 1.6s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease forwards',
        'fade-in':  'fade-in 0.3s ease forwards',
        float:      'float 3.5s ease-in-out infinite',
        waveform:   'waveform 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
