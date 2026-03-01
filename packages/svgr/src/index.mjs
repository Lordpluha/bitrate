import { runCli } from './cli.mjs'

export { build } from './modes/build.mjs'
export { dev } from './modes/dev.mjs'

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli()
}