import { writeFile } from 'fs/promises'
import { exec } from 'child_process'

async function main() {
  const res = await fetch(`http://localhost:3000/swagger/json`)
  const json = await res.json()

  await writeFile('swagger/spotify.json', JSON.stringify(json, null, 2))
  console.log('✅ Saved swagger/spotify.json')

  await exec('pnpm dlx openapi-typescript swagger/spotify.json -o src/api/v1.ts')
  console.log('✅ Generated src/api/v1.ts')
}

main().catch(console.error)
