// tailwind.config.js
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import radixPlugin from 'tailwindcss-radix'

const config = {
  // ... rest of your config
  
  theme: {
    extend: {
      animation: {
        'price-up': 'priceUp 1s ease-in-out',
        'price-down': 'priceDown 1s ease-in-out'
      },
      colors: {
        card: 'var(--card-bg)',
        'card-foreground': 'var(--card-fg)',
        'card-bg': 'var(--card-bg)',
        'card-positive': 'var(--card-positive-bg)',
        'card-negative': 'var(--card-negative-bg)',
        'text-card': 'var(--card-text)'
      }
    }
  },
  plugins: [
    forms,
    typography,
    radixPlugin()
  ]
}

export default config;