import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        focus: 'var(--focus)',
        danger: 'var(--danger)',
        aqi: {
          good: 'var(--aqi-good)',
          moderate: 'var(--aqi-moderate)',
          sensitive: 'var(--aqi-sensitive)',
          unhealthy: 'var(--aqi-unhealthy)',
          veryUnhealthy: 'var(--aqi-very-unhealthy)',
          hazardous: 'var(--aqi-hazardous)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
