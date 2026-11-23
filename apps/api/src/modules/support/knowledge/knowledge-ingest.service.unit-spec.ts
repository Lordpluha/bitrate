import { describe, expect, it } from '@jest/globals'
import type { KnowledgeConfig } from './knowledge-config'
import { KnowledgeIngestService } from './knowledge-ingest.service'
import type { KnowledgeIngestDeps } from './knowledge-ingest-deps'
import type { KnowledgePoint, KnowledgeStore } from './knowledge-store'
import type { KnowledgeFile } from './read-knowledge-files'

const config: KnowledgeConfig = {
  qdrantUrl: 'http://qdrant:6333',
  openaiApiKey: 'test',
  embedModel: 'openai:text-embedding-3-small',
  knowledgeDir: '/knowledge',
}

const files: KnowledgeFile[] = [
  { kind: 'help', path: 'listener/en/a.md', raw: 'A' },
  { kind: 'legal', path: 'privacy-policy.md', raw: 'P' },
]

class FakeStore implements KnowledgeStore {
  current: string | undefined
  rebuilt: { collection: string; points: KnowledgePoint[] }[] = []

  currentCollection() {
    return Promise.resolve(this.current)
  }

  rebuild(collection: string, points: KnowledgePoint[]) {
    this.rebuilt.push({ collection, points })
    this.current = collection
    return Promise.resolve()
  }
}

function setup(overrides: Partial<KnowledgeIngestDeps> = {}) {
  const store = new FakeStore()
  const embedded: string[] = []
  const deps: KnowledgeIngestDeps = {
    config,
    store,
    readFiles: async () => files,
    toChunks: async (input) =>
      input.map((file, index) => ({
        id: `${file.path}#0`,
        slug: file.path,
        title: `Title ${index}`,
        audience: 'all',
        locale: 'en',
        text: `chunk of ${file.raw}`,
      })),
    embed: (texts) => {
      embedded.push(...texts)
      return Promise.resolve(texts.map(() => [0.1, 0.2, 0.3]))
    },
    ...overrides,
  }
  return { service: new KnowledgeIngestService(deps), store, embedded }
}

describe('KnowledgeIngestService', () => {
  it('skips the ingest when Qdrant or the embedding key is not configured', async () => {
    const { service, store } = setup({ config: undefined, store: undefined })

    await expect(service.ingest()).resolves.toEqual({ status: 'skipped-unconfigured' })
    expect(store.rebuilt).toEqual([])
  })

  it('embeds every chunk and rebuilds a collection named after the sources', async () => {
    const { service, store, embedded } = setup()

    const result = await service.ingest()

    expect(result).toMatchObject({ status: 'rebuilt', documents: 2, chunks: 2 })
    expect(embedded).toEqual(['chunk of A', 'chunk of P'])
    expect(store.rebuilt).toHaveLength(1)
    expect(store.rebuilt[0]?.collection).toMatch(
      /^support_knowledge_openai_text_embedding_3_small_[0-9a-f]{12}$/,
    )
    expect(store.rebuilt[0]?.points[0]).toMatchObject({
      vector: [0.1, 0.2, 0.3],
      chunk: { id: 'listener/en/a.md#0', text: 'chunk of A' },
    })
  })

  it('does no work when the current collection already matches the sources', async () => {
    const first = setup()
    await first.service.ingest()
    const { service, store, embedded } = setup()
    store.current = first.store.current

    await expect(service.ingest()).resolves.toMatchObject({ status: 'unchanged' })
    expect(embedded).toEqual([])
    expect(store.rebuilt).toEqual([])
  })

  it('builds a new collection when the embedding model changes', async () => {
    const first = setup()
    await first.service.ingest()
    const { service, store } = setup({
      config: { ...config, embedModel: 'openai:text-embedding-3-large' },
    })
    store.current = first.store.current

    await expect(service.ingest()).resolves.toMatchObject({ status: 'rebuilt' })
    expect(store.current).not.toBe(first.store.current)
  })

  it('refuses to replace the index with an empty one', async () => {
    const { service, store } = setup({ readFiles: async () => [] })

    await expect(service.ingest()).rejects.toThrow(/no knowledge sources/)
    expect(store.rebuilt).toEqual([])
  })
})
