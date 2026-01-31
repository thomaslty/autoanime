import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        },
        '/health': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    define: {
      'import.meta.env.VITE_SONARR_URL': JSON.stringify(env.VITE_SONARR_URL || 'http://localhost:8989'),
      'import.meta.env.VITE_SONARR_API_KEY': JSON.stringify(env.VITE_SONARR_API_KEY || '')
    }
  }
})
