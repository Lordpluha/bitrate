import type { KnowledgeChunk } from '@bitrate/support-core'
import { afterAll, describe, expect, it } from '@jest/globals'
import { createQdrantClient } from './create-qdrant-client'
import { KNOWLEDGE_ALIAS, KNOWLEDGE_COLLECTION_PREFIX } from './knowledge-collection-name'
import { QdrantKnowledgeIndex } from './qdrant-knowledge-index'
import { QdrantKnowledgeStore } from './qdrant-knowledge-store'

/**
 * Runs the Qdrant store and index against a real Qdrant (the dev compose service in CI).
 * Point it at one with QDRANT_INT_URL. Without it the suite is skipped locally, but fails
 * under CI so it can never be skipped silently there.
 */
const url = process.env.QDRANT_INT_URL
const suite = url ? describe : describe.skip

const chunk = (
  id: string,
  audience: KnowledgeChunk['audience'],
  locale: KnowledgeChunk['locale'],
) => ({
  id,
  slug: id,
  title: `Title ${id}`,
  audience,
  locale,
  url: `https://bitrate.me/${id}`,
  text: `Text ${id}`,
})

describe('Qdrant knowledge integration setup', () => {
  it('has Qdrant configured when running in CI', () => {
    if (process.env.CI) expect(url).toBeTruthy()
  })
})

suite('QdrantKnowledgeStore + QdrantKnowledgeIndex', () => {
  const client = createQdrantClient({ qdrantUrl: url ?? '' })
  const store = new QdrantKnowledgeStore(client)
  const index = new QdrantKnowledgeIndex(client)

  afterAll(async () => {
    const { aliases } = await client.getAliases()
    if (aliases.some((alias) => alias.alias_name === KNOWLEDGE_ALIAS)) {
      await client.updateCollectionAliases({
        actions: [{ delete_alias: { alias_name: KNOWLEDGE_ALIAS } }],
      })
    }
    const { collections } = await client.getCollections()
    for (const { name } of collections) {
      if (name.startsWith(KNOWLEDGE_COLLECTION_PREFIX)) await client.deleteCollection(name)
    }
  })

  it('serves a rebuilt collection through the alias, filtered by audience and locale', async () => {
    const collection = `${KNOWLEDGE_COLLECTION_PREFIX}int_first`
    await store.rebuild(collection, [
      { vector: [1, 0, 0], chunk: chunk('listener-en', 'listener', 'en') },
      { vector: [0.9, 0.1, 0], chunk: chunk('all-en', 'all', 'en') },
      { vector: [1, 0, 0], chunk: chunk('artist-en', 'artist', 'en') },
      { vector: [1, 0, 0], chunk: chunk('listener-pl', 'listener', 'pl') },
    ])

    expect(await store.currentCollection()).toBe(collection)
    const hits = await index.search({
      vector: [1, 0, 0],
      text: 'delete account',
      audiences: ['listener', 'all'],
      locale: 'en',
      limit: 5,
    })
    expect(hits.map((hit) => hit.chunkId)).toEqual(['listener-en', 'all-en'])
    expect(hits[0]).toMatchObject({
      title: 'Title listener-en',
      url: 'https://bitrate.me/listener-en',
      text: 'Text listener-en',
    })
    expect(hits[0]?.score).toBeGreaterThan(hits[1]?.score ?? 1)
  })

  it('moves the alias to a new collection and drops the old one', async () => {
    const next = `${KNOWLEDGE_COLLECTION_PREFIX}int_second`
    await store.rebuild(next, [{ vector: [0, 1, 0], chunk: chunk('artist-uk', 'artist', 'uk') }])

    expect(await store.currentCollection()).toBe(next)
    const { collections } = await client.getCollections()
    const names = collections
      .map(({ name }) => name)
      .filter((name) => name.startsWith(KNOWLEDGE_COLLECTION_PREFIX))
    expect(names).toEqual([next])
    const hits = await index.search({
      vector: [0, 1, 0],
      text: 'x',
      audiences: ['artist'],
      limit: 5,
    })
    expect(hits.map((hit) => hit.chunkId)).toEqual(['artist-uk'])
  })
})
