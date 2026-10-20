import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from '@docusaurus/types'

import { ADR_INDEX_PLUGIN, type AdrIndex, type AdrSummary } from './adrIndexData'

const ADR_FILE = /^(\d{4})-(.+)\.mdx?$/
const H1 = /^#\s+(?:ADR-\d{4}:\s*)?(.+)$/m

/**
 * Publishes every ADR's number and title as global data, newest first. The docs plugin's own
 * global data carries only ids and paths, and the ids lose the record number.
 */
export default function adrIndexPlugin(): Plugin {
  const dir = path.join(__dirname, '../../docs/architecture')
  return {
    name: ADR_INDEX_PLUGIN,
    async loadContent(): Promise<AdrIndex> {
      const files = (await readdir(dir)).filter((file) => ADR_FILE.test(file))
      const adrs = await Promise.all(
        files.map(async (file): Promise<AdrSummary> => {
          const [, number, slug] = ADR_FILE.exec(file) ?? []
          const source = await readFile(path.join(dir, file), 'utf8')
          return {
            number,
            title: H1.exec(source)?.[1].trim() ?? slug,
            docId: `architecture/${slug}`,
          }
        }),
      )
      return { adrs: adrs.sort((a, b) => b.number.localeCompare(a.number)) }
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content)
    },
  }
}
