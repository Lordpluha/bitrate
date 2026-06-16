import { resolve } from 'node:path'
import { svgrPlugin } from '@spotify/vite-svgr'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    svgrPlugin({
      input: '@spotify/tokens/icons',
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
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // externalize everything that's not a relative/absolute path (all node_modules)
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
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
