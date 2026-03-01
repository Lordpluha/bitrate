import fs from 'node:fs'
import openapiTS, { astToString } from 'openapi-typescript'

async function main() {
  console.log('🔍 Fetching OpenAPI spec and generating TypeScript client...')
  const ast = await openapiTS(new URL('http://localhost:3000/swagger/json'))
  console.log('✅ OpenAPI spec fetched successfully')
  const content = astToString(ast)
  console.log('✅ TypeScript client generated successfully')
  fs.writeFileSync('src/api/v1.ts', content)
  console.log('✅ Generated src/api/v1.ts')
}

main().catch(console.error)
