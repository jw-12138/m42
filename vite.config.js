import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  sourcemap: true,
  plugins: [vue()]
})
