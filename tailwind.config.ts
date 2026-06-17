import type { Config } from 'tailwindcss'

/**
 * Tokens centralizados da identidade Bellus.
 * Direção: editorial cinematográfico — carvão quente, marfim e dourado acessível.
 * As cores vivem como CSS variables em globals.css; aqui só as expomos ao Tailwind.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        ivory: 'var(--ivory)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        charcoal: 'var(--charcoal)',
        'charcoal-soft': 'var(--charcoal-soft)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        line: 'var(--line)',
        'line-dark': 'var(--line-dark)',
        cream: 'var(--cream)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        prose: '38rem',
        content: '72rem',
      },
      borderRadius: {
        xl2: '0.5rem',
      },
      boxShadow: {
        // Anel dourado 1px + sombra suave — assinatura de cartão do site referência.
        soft: '0 0 0 1px rgba(143, 115, 77, 0.10), 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        lift: '0 0 0 1px rgba(143, 115, 77, 0.16), 0 25px 50px -12px rgba(0, 0, 0, 0.22)',
        bar: '0 -8px 28px -18px rgba(20, 20, 20, 0.45)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s var(--ease-soft) both',
        'fade-in': 'fade-in 0.9s var(--ease-soft) both',
      },
    },
  },
  plugins: [],
}

export default config
