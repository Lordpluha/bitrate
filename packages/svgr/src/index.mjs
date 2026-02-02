import { runCli } from './cli.mjs'

export { build } from './modes/build.mjs'
export { dev } from './modes/dev.mjs'

// Запускаем CLI если файл выполняется напрямую
const scriptPath = process.argv[1]
const modulePath = new URL(import.meta.url).pathname

if (scriptPath && modulePath.endsWith(scriptPath.split('/').pop())) {
  runCli()
}
