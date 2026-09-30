// Nest 12 ships ESM only and reads import.meta.url. Jest runs the API as CommonJS, so
// transpile @nestjs/* to CommonJS with swc, which rewrites import.meta to __filename/__dirname.
const { transformSync } = require('@swc/core')

module.exports = {
  process(source, filename) {
    const { code, map } = transformSync(source, {
      filename,
      isModule: true,
      sourceMaps: true,
      module: { type: 'commonjs' },
      jsc: { target: 'es2022' },
    })
    return { code, map }
  },
}
