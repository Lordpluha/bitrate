import type { KnowledgeChunk } from '@bitrate/support-core'
import { loadSupportCore } from './load-support-core'
import type { KnowledgeFile } from './read-knowledge-files'
import { toLegalDocument } from './to-legal-document'

/**
 * Parses and chunks the sources with the support core. Help articles go through
 * `parseHelpArticle`, which rejects drafts and mislabelled folders; legal texts through
 * the allowlist in `toLegalDocument`.
 */
export async function buildKnowledgeChunks(
  files: readonly KnowledgeFile[],
): Promise<KnowledgeChunk[]> {
  const core = await loadSupportCore()
  return files.flatMap((file) =>
    core.chunkKnowledgeDocument(
      file.kind === 'help'
        ? core.parseHelpArticle(file.path, file.raw)
        : toLegalDocument(file.path, file.raw),
    ),
  )
}
