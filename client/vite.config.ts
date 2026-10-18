import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Base path GitHub Pages : le site est servi sur https://bykeyrin.github.io/UnlockTracker/
  base: '/UnlockTracker/',
  plugins: [react(), tailwindcss()],
})
