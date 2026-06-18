import { runCli } from './cli.mjs'

export { processSvgFiles } from './core/processor.mjs'
export { build } from './modes/build.mjs'
export { dev } from './modes/dev.mjs'
export { resolvePath } from './utils/resolve-path.mjs'

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli()
}
