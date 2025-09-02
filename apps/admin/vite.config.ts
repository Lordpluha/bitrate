import { defineConfig } from 'vite';
import { vitePlugin as kottster } from '@kottster/react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './app',
  server: {
    port: 3002,
    open: false,
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    kottster(),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/app'
    }
  },
});