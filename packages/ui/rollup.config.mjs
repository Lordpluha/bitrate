import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import peerExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = __dirname

function preserveUseClient() {
  const clientFiles = new Set()

  return {
    name: 'preserve-use-client',

    // На этапе transform читаем исходник и помечаем файлы с директивой
    transform(code, id) {
      if (!id.endsWith('.tsx') && !id.endsWith('.ts')) return null
      const hasUseClient = /^\s*(['"])use client\1\s*;?/m.test(code)
      if (hasUseClient) clientFiles.add(id)
      return null // ничего не меняем тут
    },

    // На этапе рендера чанка возвращаем директиву на верх
    renderChunk(code, chunk) {
      const id = chunk.facadeModuleId // с preserveModules указывает на исходный модуль
      if (!id) return null
      if (!clientFiles.has(id)) return null

      // Если директивы ещё нет сверху — добавим
      if (!/^\s*(['"])use client\1\s*;?/.test(code)) {
        return { code: `"use client";\n${code}`, map: null }
      }
      return null
    }
  }
}

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named' // ✅ гасим warning про clsx/lucide default
    }
  ],
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    '@radix-ui/react-avatar',
    '@radix-ui/react-label',
    '@radix-ui/react-separator',
    'next-themes',
    'sonner',
    /^embla-carousel($|\/)/,
    /^embla-carousel-react($|\/)/,
    /^embla-carousel-autoplay($|\/)/
  ],
  plugins: [
    peerExternal(),
    alias({
      entries: [{ find: '@', replacement: path.resolve(projectRoot, 'src') }]
    }),
    resolve({ extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'] }),
    commonjs(),
    typescript({
      tsconfig: path.resolve(projectRoot, 'tsconfig.json'),
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        composite: false,
        noEmit: false
      }
    }),
    postcss({
      extract: 'globals.css', // => dist/esm/globals.css и dist/cjs/globals.css не нужны, кладём 1 файл ниже
      sourceMap: true,
      minimize: false,
      config: true
      // чтобы css оказался в корне dist, а не в каждой папке:
      // плагин не поддерживает прямую смену каталога, поэтому оставим как есть
    }),
    preserveUseClient()
  ]
}
