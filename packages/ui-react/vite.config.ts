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
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      ],
    },
  },
})
