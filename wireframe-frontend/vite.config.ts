import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['39f3ae5d-d91b-4c54-9ea4-5c395bb8c2f2-00-37md1qc6p8i2a.sisko.replit.dev'],
    hmr: {
      port: 5000
    }
  }
})
