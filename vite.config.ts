import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin panel runs on port 5174 to avoid conflict with portfolio (5173)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
})
