import path from 'node:path'
import { processSvgFiles, resolvePath } from '@spotify/svgr'

/**
 * Vite plugin that integrates @spotify/svgr into the build pipeline.
 *
 * Build mode      — runs once in buildStart before any module transforms.
 * Watch mode      — re-runs on any .svg change in the input directory.
 * Dev server mode — attaches to chokidar, triggers a full-reload on SVG changes.
 *
 * @param {import('./index.d.mts').SvgrPluginOptions} options
 * @returns {import('vite').Plugin}
 */
export function svgrPlugin(options) {
  const { input, output, variables = [] } = options

  let resolvedInput
  let resolvedOutput

  async function resolveDirs() {
    const cwd = process.cwd()
    resolvedInput ??= await resolvePath(input, cwd)
    resolvedOutput ??= output.startsWith('@')
      ? await resolvePath(output, cwd)
      : path.resolve(cwd, output)
  }

  async function runBuild() {
    await processSvgFiles(resolvedInput, resolvedOutput, {
      clean: true,
      verbose: true,
      colorVarNames: variables,
    })
  }

  return {
    name: 'spotify-vite-svgr',

    async buildStart() {
      await resolveDirs()
      await runBuild()

      if (this.meta.watchMode) {
        // Watches the entire input dir so any SVG add/change/delete triggers a Vite rebuild,
        // which calls buildStart again and re-runs the full generation.
        this.addWatchFile(resolvedInput)
      }
    },

    async configureServer(server) {
      await resolveDirs()
      server.watcher.add(resolvedInput)

      const rebuild = async () => {
        try {
          await runBuild()
          server.ws.send({ type: 'full-reload' })
        } catch (err) {
          console.error('[vite-svgr] rebuild failed:', err)
        }
      }

      const isSvg = (file) => file.startsWith(resolvedInput) && file.endsWith('.svg')

      server.watcher.on('change', (file) => {
        if (isSvg(file)) rebuild()
      })
      server.watcher.on('add', (file) => {
        if (isSvg(file)) rebuild()
      })
      server.watcher.on('unlink', (file) => {
        if (isSvg(file)) rebuild()
      })
    },
  }
}
