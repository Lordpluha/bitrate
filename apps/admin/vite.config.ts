import { defineConfig } from 'vite';
import { vitePlugin as kottster } from '@kottster/react';
import react from '@vitejs/plugin-react';
import schema from './kottster-app.json';

export default defineConfig({
  root: './app',
  server: {
    port: 5480,
    open: false,
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
    chunkSizeWarningLimit: 10000,
  },
  plugins: [
    kottster({ schema }),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/app'
    }
  },
});