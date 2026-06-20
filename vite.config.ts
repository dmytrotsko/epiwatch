import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rest': {
        target: 'https://staging.delphi.cmu.edu/epiportal',
        changeOrigin: true,
        secure: true,
      },
      '/available-indicators': {
        target: 'https://staging.delphi.cmu.edu/epiportal',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
