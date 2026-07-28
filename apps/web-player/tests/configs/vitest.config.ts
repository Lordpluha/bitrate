import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const root = resolve(__dirname, '../..')

const alias = {
  '@': resolve(root, 'src'),
  '@app': resolve(root, 'src/app'),
  '@entities': resolve(root, 'src/entities'),
  '@features': resolve(root, 'src/features'),
  '@shared': resolve(root, 'src/shared'),
  '@views': resolve(root, 'src/views'),
  '@widgets': resolve(root, 'src/widgets'),
}

export default defineConfig({
  root,
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['src/**/*.unit-spec.{ts,tsx}'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'integration',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['src/**/*.int-spec.{ts,tsx}'],
          testTimeout: 30_000,
        },
      },
    ],
  },
})
