import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import openapiTS, { astToString } from 'openapi-typescript'

/**
 * One contract per API process (#458): the public API (listeners and artists) and the operator
 * API, each generated from the document its own process serves.
 */
const CONTRACTS = [
  {
    output: 'src/api/v1.ts',
    source: process.env.OPENAPI_URL ?? 'http://localhost:3000/swagger/json',
  },
  {
    output: 'src/api/admin-v1.ts',
    source: process.env.ADMIN_OPENAPI_URL ?? 'http://localhost:3007/swagger/json',
  },
] as const

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
function formatOutput(content: string, output: string): string {
  return execFileSync('biome', ['format', `--stdin-file-path=${output}`], {
    input: content,
    encoding: 'utf8',
    maxBuffer: FORMAT_MAX_BUFFER_BYTES,
  })
}

async function main() {
  for (const { output, source } of CONTRACTS) {
    console.log(`🔍 Fetching ${source} and generating TypeScript client...`)
    const ast = await openapiTS(new URL(source))
    console.log('✅ OpenAPI spec fetched successfully')
    const content = astToString(ast)
    fs.writeFileSync(output, formatOutput(content, output))
    console.log(`✅ Generated ${output}`)
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
