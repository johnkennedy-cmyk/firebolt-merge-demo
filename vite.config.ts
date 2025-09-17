import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/firebolt': {
        target: 'http://localhost:3473',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/firebolt/, ''),
      },
    },
  },
})
