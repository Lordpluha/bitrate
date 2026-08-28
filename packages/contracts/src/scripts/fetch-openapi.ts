import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import openapiTS, { astToString } from 'openapi-typescript'

const OUTPUT_PATH = 'src/api/v1.ts'

/**
 * Formats the generated file with Biome.
 *
 * `astToString` emits the TypeScript printer's own style (semicolons, four-space
 * indent), which never matches the repository formatter. Without this the file is
 * reported as changed on every run and the CI reproducibility check can never pass.
 */
function formatOutput() {
  execFileSync('biome', ['format', '--write', OUTPUT_PATH], { stdio: 'inherit' })
}

async function main() {
  console.log('🔍 Fetching OpenAPI spec and generating TypeScript client...')
  const source = process.env.OPENAPI_URL ?? 'http://localhost:3000/swagger/json'
  const ast = await openapiTS(new URL(source))
  console.log('✅ OpenAPI spec fetched successfully')
  const content = astToString(ast)
  console.log('✅ TypeScript client generated successfully')
  fs.writeFileSync(OUTPUT_PATH, content)
  formatOutput()
  console.log(`✅ Generated ${OUTPUT_PATH}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
