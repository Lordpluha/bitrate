import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    /**
     * No `compilerOptions` here — `svelte()` auto-loads `svelte.config.js` at the project
     * root, which is the single source of `{ runes: true, customElement: true }` for this
     * package (also read by `svelte-check` and `vitest.config.ts`'s `browser` project).
     */
    svelte(),
    dts({
      include: ['src'],
      exclude: [
        '**/*.unit-spec.*',
        '**/*.browser-spec.*',
        '**/*.screenshot-spec.*',
        '**/__tests__/**',
      ],
      outDir: 'dist/types',
      tsconfigPath: './tsconfig.build.json',
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'contract/index': resolve(import.meta.dirname, 'src/contract/index.ts'),
        'engine/index': resolve(import.meta.dirname, 'src/engine/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
      output: {
        format: 'es',
        dir: 'dist/esm',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
