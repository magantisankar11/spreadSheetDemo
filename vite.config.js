import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,      // 👈 choose your port here
    host: true,      // allow access from network (e.g., LAN or Render preview)
    open: true,       // auto-open browser on start
    allowedHosts: 'all', // 👈 allow access from network (e.g., LAN or Render preview)
  }
})
