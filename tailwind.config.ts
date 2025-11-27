import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        epilot: {
          blue: '#0066FF',
          cyan: '#00D4FF',
          purple: '#7B61FF',
        },
      },
      boxShadow: {
        'epilot-sm': '0 2px 8px rgba(0, 102, 255, 0.08)',
        'epilot-lg': '0 8px 24px rgba(0, 102, 255, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;

