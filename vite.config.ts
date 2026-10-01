import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base works for both <user>.github.io and <user>.github.io/<repo>/
export default defineConfig({
  base: './',
  plugins: [react()],
})
