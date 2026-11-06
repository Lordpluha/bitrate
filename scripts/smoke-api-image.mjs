// Smoke test for the built API image: every runtime dependency must be resolvable from the app.
//
// Run INSIDE the image, mounted into /app/apps/api so packages resolve exactly as the app's own
// code does (see the "Smoke-test the image" step in .github/workflows/api_reusable.yml):
//
//   docker run --rm --entrypoint node -v "$PWD/scripts/smoke-api-image.mjs:/app/apps/api/smoke.mjs:ro" \
//     <image> /app/apps/api/smoke.mjs
//
// Why: v0.7.0 shipped an image whose @bitrate/converter link pointed at a directory the image did
// not contain. Nothing failed until a transcode job imported it, and every track uploaded then
// stayed in PROCESSING. This fails the build instead.
//
// Third-party packages are only resolved (resolution reads their package.json and checks the
// entry file exists, without running it -- `prisma` is a CLI). Workspace packages are imported,
// so a file missing inside them is caught too. `@types/*` ships no runtime entry and is skipped.
import { readFileSync } from 'node:fs'

/**
 * Declared as dependencies but deliberately absent from the production image. Each needs a
 * reason; anything not listed here must resolve.
 */
const NOT_IN_PRODUCTION = new Map([
  // Only the NCS import seeder uses it, and seeding runs from the development image
  // (apps/api/Dockerfile builds it there); the production app never loads the seeders.
  ['@bitrate/ncs-parser', 'seed-only'],
])

const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const names = Object.keys(manifest.dependencies ?? {}).filter(
  (name) => !name.startsWith('@types/') && !NOT_IN_PRODUCTION.has(name),
)

const failures = []
for (const name of names) {
  try {
    if (name.startsWith('@bitrate/')) {
      await import(name)
    } else {
      import.meta.resolve(name)
    }
  } catch (error) {
    failures.push(`${name}: ${error?.code ?? ''} ${error?.message?.split('\n')[0] ?? error}`)
  }
}

if (failures.length > 0) {
  console.error(`::error::${failures.length} runtime dependencies are missing from the API image:`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}
console.log(`All ${names.length} runtime dependencies of @bitrate/api resolve in the image.`)
