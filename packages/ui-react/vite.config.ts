import { resolve } from 'node:path'
import { svgrPlugin } from '@bitrate/vite-svgr'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    svgrPlugin({
      input: './assets/icons',
      output: 'src/icons/svgr',
      variables: ['primaryColor', 'secondaryColor'],
    }),
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: [
        '**/*.stories.*',
        '**/*.spec.*',
        '**/*.test.*',
        '**/*.screenshot-spec.*',
        '**/*.snapshot-spec.*',
        '**/*.unit-spec.*',
        '**/*.int-spec.*',
      ],
      outDir: 'dist/types',
      tsconfigPath: './tsconfig.build.json',
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'assets'),
    },
  },
  build: {
    outDir: 'dist',
    /* Empties dist/esm and dist/cjs — the dirs rollup writes below. It does not reach
       dist/types (vite-plugin-dts), which is why `pnpm clean` runs first; see
       scripts/clean-dist.mjs. */
    emptyOutDir: true,
    /* Vite's own default turns this off for a --watch build (`pnpm dev`), on the assumption
       that `--watch` means a dev server iterating against unminified output. This package's
       `dev` script is `vite build --watch` — its dist/ is what every consuming app's own dev
       server resolves `@bitrate/ui-react` to, including icons — so an unminified watch build
       is still a real, consumed artifact, not a throwaway one. Forced on unconditionally
       rather than left to that mode-dependent default. */
    minify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0') && !id.startsWith('@/'),
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          /* Vite's own `minify: true` still leaves ES-format library output with
             `codegen: false` — names get mangled but whitespace/structure survive. This
             overrides that per-format default so the ESM output is fully compacted too,
             the same as CJS gets from that default already. */
          minify: true,
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          minify: true,
        },
      ],
    },
  },
})
