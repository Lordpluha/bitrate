import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const alias = { '@': resolve(__dirname, 'src') }

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'happy-dom',
          globals: true,
          setupFiles: ['./vitest-setup.ts'],
          include: [
            'src/**/*.unit-spec.{ts,tsx}',
            'src/**/*.snapshot-spec.{ts,tsx}',
            'src/**/*.int-spec.{ts,tsx}',
          ],
          snapshotOptions: {
            snapshotsDirName: '__snapshots__',
          },
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'screenshot',
          globals: true,
          setupFiles: ['./vitest-browser-setup.ts'],
          include: ['src/**/*.screenshot-spec.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  threshold: 0.2,
                  allowedMismatchedPixelRatio: 0.01,
                },
              },
            },
          },
        },
      },
    ],
  },
})
