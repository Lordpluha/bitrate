import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

/** Binary names the official `shaka-packager` npm package ships, by platform and architecture. */
const BINARIES = {
  linux: { x64: 'packager-linux-x64', arm64: 'packager-linux-arm64' },
  darwin: { x64: 'packager-osx-x64', arm64: 'packager-osx-arm64' },
  win32: { x64: 'packager-win-x64.exe' },
}

/**
 * Resolves the Shaka Packager binary for this platform. The package's own `index.js` wrapper is
 * not used: it exits 0 even when the packager fails.
 *
 * @param {NodeJS.Platform} [platform]
 * @param {string} [arch]
 * @returns {string} absolute path to the binary
 */
export function packagerPath(platform = process.platform, arch = process.arch) {
  const name = BINARIES[platform]?.[arch]
  if (!name) throw new Error(`Shaka Packager has no binary for ${platform}/${arch}`)
  const packageJson = createRequire(import.meta.url).resolve('shaka-packager/package.json')
  return join(dirname(packageJson), 'bin', name)
}
