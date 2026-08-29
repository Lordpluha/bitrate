import path, { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const alias = {
  '@': resolve(__dirname, 'src'),
  '@assets': resolve(__dirname, 'assets'),
}

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest-setup.ts'],
          include: ['src/**/*.unit-spec.{ts,tsx}'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'integration',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest-setup.ts'],
          include: ['src/**/*.int-spec.{ts,tsx}'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'snapshot',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest-setup.ts'],
          include: ['src/**/*.snapshot-spec.{ts,tsx}'],
        },
      },
      {
        plugins: [tailwindcss(), react()],
        resolve: { alias },
        test: {
          name: 'screenshot',
          globals: true,
          fileParallelism: false,
          testTimeout: 60_000,
          setupFiles: ['./vitest-browser-setup.ts'],
          include: ['src/**/*.screenshot-spec.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                args: [
                  '--font-render-hinting=none',
                  '--disable-font-subpixel-positioning',
                  '--disable-lcd-text',
                ],
              },
            }),
            screenshotFailures: false,
            expect: {
              toMatchScreenshot: {
                resolveScreenshotPath: (data) =>
                  path.join(
                    data.testFileDirectory,
                    '__screenshots__',
                    `${data.testName}-${data.browserName}${data.ext}`,
                  ),
              },
            },
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
