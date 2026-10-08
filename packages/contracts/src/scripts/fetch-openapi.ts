import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import openapiTS, { astToString } from 'openapi-typescript'

const OUTPUT_PATH = 'src/api/v1.ts'
/** Room for the formatted contract on stdout; Node's 1 MiB default is smaller than it. */
const FORMAT_MAX_BUFFER_BYTES = 64 * 1024 * 1024

/**
 * Formats the generated source with Biome.
 *
 * `astToString` emits the TypeScript printer's own style (semicolons, four-space
 * indent), which never matches the repository formatter. Without this the file is
 * reported as changed on every run and the CI reproducibility check can never pass.
 * The source goes through stdin because Biome skips files above its 1 MiB size limit,
 * and the unformatted contract exceeds it.
 */
function formatOutput(content: string): string {
  return execFileSync('biome', ['format', `--stdin-file-path=${OUTPUT_PATH}`], {
    input: content,
    encoding: 'utf8',
    maxBuffer: FORMAT_MAX_BUFFER_BYTES,
  })
}

async function main() {
  console.log('🔍 Fetching OpenAPI spec and generating TypeScript client...')
  const source = process.env.OPENAPI_URL ?? 'http://localhost:3000/swagger/json'
  const ast = await openapiTS(new URL(source))
  console.log('✅ OpenAPI spec fetched successfully')
  const content = astToString(ast)
  console.log('✅ TypeScript client generated successfully')
  fs.writeFileSync(OUTPUT_PATH, formatOutput(content))
  console.log(`✅ Generated ${OUTPUT_PATH}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
