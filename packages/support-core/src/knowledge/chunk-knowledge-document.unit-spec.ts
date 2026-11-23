import { describe, expect, it } from 'vitest'
import { chunkKnowledgeDocument } from './chunk-knowledge-document.js'

const base = {
  slug: 'guide',
  title: 'Guide',
  audience: 'all' as const,
  locale: 'en' as const,
}

describe('chunkKnowledgeDocument', () => {
  it('keeps a short article in one chunk that carries its title and filters', () => {
    const chunks = chunkKnowledgeDocument({ ...base, url: 'https://x.test', body: 'One.\n\nTwo.' })

    expect(chunks).toEqual([
      {
        id: 'all/en/guide#0',
        slug: 'guide',
        title: 'Guide',
        audience: 'all',
        locale: 'en',
        url: 'https://x.test',
        text: 'Guide\n\nOne.\n\nTwo.',
      },
    ])
  })

  it('splits at section headings and keeps the heading in the chunk', () => {
    const chunks = chunkKnowledgeDocument({
      ...base,
      body: 'Intro.\n\n## Sign in\n\nUse Google.\n\n## Delete\n\nEmail us.',
    })

    expect(chunks.map((chunk) => chunk.text)).toEqual([
      'Guide\n\nIntro.',
      'Guide — Sign in\n\nUse Google.',
      'Guide — Delete\n\nEmail us.',
    ])
    expect(chunks.map((chunk) => chunk.id)).toEqual([
      'all/en/guide#0',
      'all/en/guide#1',
      'all/en/guide#2',
    ])
  })

  it('strips closing # from headings', () => {
    const chunks = chunkKnowledgeDocument({ ...base, body: '## Section ##\n\nText.' })
    expect(chunks[0]?.text).toBe('Guide — Section\n\nText.')
  })

  it('packs paragraphs up to the size limit without splitting one', () => {
    const paragraph = 'word '.repeat(40).trim()
    const chunks = chunkKnowledgeDocument(
      { ...base, body: [paragraph, paragraph, paragraph].join('\n\n') },
      { maxChars: 450 },
    )

    expect(chunks).toHaveLength(2)
    for (const chunk of chunks) expect(chunk.text.length).toBeLessThanOrEqual(450)
  })

  it('splits a paragraph longer than the limit by words', () => {
    const chunks = chunkKnowledgeDocument(
      { ...base, body: 'word '.repeat(200).trim() },
      { maxChars: 300 },
    )

    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) expect(chunk.text.length).toBeLessThanOrEqual(300)
  })
})
