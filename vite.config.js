import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    // Permitir acesso via Nginx
    allowedHosts: [
      'dev.alvelos.com',
    ],

    // Proxy para Django
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
      }
    },

    // HMR via HTTPS + Nginx
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
  },

  clearScreen: false,
  logLevel: 'info',
})
