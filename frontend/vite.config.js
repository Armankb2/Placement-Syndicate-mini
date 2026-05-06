import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ['placementsyndicate.serveousercontent.com', 'executory-recriminatory-ellison.ngrok-free.dev', '.ngrok-free.dev', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        headers: {
          Connection: 'keep-alive'
        }
      },
    },
  },
})
