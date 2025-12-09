import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Firebolt Cloud API (via backend server)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Legacy: Firebolt Core direct connection (localhost)
      '/api/firebolt-core': {
        target: 'http://localhost:3473',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/firebolt-core/, ''),
      },
    },
  },
})
