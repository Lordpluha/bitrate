import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright/**',
      '**/tests/**', // Exclude Playwright tests
      '**/tests-examples/**', // Exclude Playwright example tests
      '**/.{idea,git,cache,output,temp}/**'
    ]
  },
  define: {
    'process.env': process.env,
  }
})