import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteSingleFile } from 'vite-plugin-singlefile'


// https://vite.dev/config/
export default defineConfig({
  base: './',   // ensures assets use relative paths
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // make sure all assets get inlined
    rollupOptions: {
      output: {
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    viteSingleFile()
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
     allowedHosts: [
      'spreadsheetdemo.onrender.com', // 👈 whitelist your Render host
      'localhost'
    ]
  }
})
