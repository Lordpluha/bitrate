import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { LEGAL_KNOWLEDGE_SOURCES } from './legal-knowledge-sources'

/** A raw knowledge source. `path` is relative to `help/` or `legal/`. */
export interface KnowledgeFile {
  kind: 'help' | 'legal'
  path: string
  raw: string
}

/** `help/README.md` documents the format; it is not an article. */
const NOT_ARTICLES = new Set(['README.md'])

/**
 * Reads every help article under `<dir>/help` and the allowlisted texts under `<dir>/legal`,
 * help first, each group sorted by path so the content hash is stable.
 */
export async function readKnowledgeFiles(dir: string): Promise<KnowledgeFile[]> {
  const help = (await listMarkdown(join(dir, 'help')))
    .filter((path) => !NOT_ARTICLES.has(path))
    .sort()
  const legal = Object.keys(LEGAL_KNOWLEDGE_SOURCES).sort()
  const files: KnowledgeFile[] = []
  for (const path of help) {
    files.push({ kind: 'help', path, raw: await readFile(join(dir, 'help', path), 'utf8') })
  }
  const present = new Set(await listMarkdown(join(dir, 'legal')))
  for (const path of legal.filter((name) => present.has(name))) {
    files.push({ kind: 'legal', path, raw: await readFile(join(dir, 'legal', path), 'utf8') })
  }
  return files
}

/** Markdown files below `root`, as `/`-separated relative paths; none when it is missing. */
async function listMarkdown(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) =>
        join(entry.parentPath, entry.name)
          .slice(root.length + 1)
          .replaceAll('\\', '/'),
      )
  } catch (error: unknown) {
    // Structural check: errors from `fs` may come from another realm (e.g. Jest's vm context).
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}
