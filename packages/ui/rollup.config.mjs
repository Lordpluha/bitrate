import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import packageJson from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'UiKit',
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript(),
      postcss({
        extract: true,
        minimize: true,
        modules: true,
      }),
      terser(),
    ],
    external: ['react', 'react-dom', 'class-variance-authority', 'class-variance-authority/types'],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
