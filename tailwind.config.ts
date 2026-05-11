import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

/**
 * All `forensic-*` colors are CSS variables defined in `src/index.css`,
 * stored as space-separated `R G B` channel triples so Tailwind's alpha
 * modifier syntax (e.g. `text-forensic-text/80`) keeps working. The two
 * variable sets live under `:root` (light) and `.dark` (dark) so flipping
 * the `dark` class on `<html>` re-themes the entire app at once.
 *
 * To add a new theme color: declare its `--forensic-<name>` channels in
 * both blocks of `index.css`, then add a token entry below.
 */
const channel = (name: string) => `rgb(var(--forensic-${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        forensic: {
          bg: channel('bg'),                     // page background
          surface: channel('surface'),           // cards, panels
          surfaceAlt: channel('surfaceAlt'),     // subtle grouping
          border: channel('border'),
          borderBright: channel('borderBright'),
          text: channel('text'),
          textMuted: channel('textMuted'),
          textDim: channel('textDim'),
          primary: channel('primary'),           // TCM red, friendly action
          primarySoft: channel('primarySoft'),
          accent: channel('accent'),
          accentSoft: channel('accentSoft'),
          corroborated: channel('corroborated'),
          herring: channel('herring'),
          context: channel('context'),
          // Code/nav surfaces stay dark in both themes by design. They
          // back the top navbar and the popovers anchored under it
          // (lab switcher, search), so they keep the brand-dark look
          // even when the page is light.
          codeBg: channel('codeBg'),
          codeHeader: channel('codeHeader'),
          codeBorder: channel('codeBorder'),
          codeText: channel('codeText'),
          codeMuted: channel('codeMuted'),
          // Top nav header. Same dark surface in both themes.
          navBg: channel('navBg'),
          // In-body snippet surfaces (CodeBlock, HexView). These DO
          // theme-switch: GitHub-light palette in light mode, the
          // deep-purple code palette in dark mode.
          snippetBg: channel('snippetBg'),
          snippetHeader: channel('snippetHeader'),
          snippetBorder: channel('snippetBorder'),
          snippetText: channel('snippetText'),
          snippetMuted: channel('snippetMuted'),
        },
      },
      boxShadow: {
        // Soft, paper-like elevation for the lab template
        'lab-sm': '0 1px 2px rgba(28, 25, 23, 0.04), 0 1px 1px rgba(28, 25, 23, 0.03)',
        'lab': '0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 12px rgba(28, 25, 23, 0.05)',
        'lab-md': '0 2px 4px rgba(28, 25, 23, 0.04), 0 8px 24px rgba(28, 25, 23, 0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [typography],
}

export default config
