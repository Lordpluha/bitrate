import { describe, expect, it } from 'vitest'
import { chunkKnowledgeDocument, KnowledgeSourceError, parseHelpArticle } from './chunker.js'

const article = `---
id: delete-account
title: Delete your listener account
draft: true
audience: listener
locale: en
sources:
  - https://bitrate.me/legal/privacy
---

To delete a listener account, email us with the subject **"Delete my account"**.

We delete the account within **30 days**.
`

describe('parseHelpArticle', () => {
  it('reads front matter and body', () => {
    const doc = parseHelpArticle('listener/en/delete-account.md', article)

    expect(doc).toEqual({
      slug: 'delete-account',
      title: 'Delete your listener account',
      audience: 'listener',
      locale: 'en',
      url: 'https://bitrate.me/legal/privacy',
      body: expect.stringContaining('We delete the account within'),
    })
    expect(doc.body).not.toContain('---')
  })

  it('rejects an article whose folder disagrees with its front matter', () => {
    expect(() => parseHelpArticle('artist/en/delete-account.md', article)).toThrow(
      KnowledgeSourceError,
    )
    expect(() => parseHelpArticle('listener/pl/delete-account.md', article)).toThrow(/locale/)
  })

  it('rejects unknown audiences and locales, and missing titles', () => {
    expect(() =>
      parseHelpArticle('fans/en/x.md', article.replace('audience: listener', 'audience: fans')),
    ).toThrow(/audience/)
    expect(() =>
      parseHelpArticle('listener/de/x.md', article.replace('locale: en', 'locale: de')),
    ).toThrow(/locale/)
    expect(() => parseHelpArticle('listener/en/x.md', article.replace(/^title: .*$/m, ''))).toThrow(
      /title/,
    )
  })

  it('refuses draft text with unfilled [[placeholders]]', () => {
    const draft = article.replace('30 days', '[[DAYS]] days')
    expect(() => parseHelpArticle('listener/en/delete-account.md', draft)).toThrow(/placeholder/)
  })
})

describe('chunkKnowledgeDocument', () => {
  const base = {
    slug: 'guide',
    title: 'Guide',
    audience: 'all' as const,
    locale: 'en' as const,
  }

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

  it('packs paragraphs up to the size limit without splitting one', () => {
    const paragraph = 'word '.repeat(40).trim()
    const chunks = chunkKnowledgeDocument(
      { ...base, body: [paragraph, paragraph, paragraph].join('\n\n') },
      { maxChars: 450 },
    )

    expect(chunks).toHaveLength(2)
    for (const chunk of chunks) expect(chunk.text.length).toBeLessThanOrEqual(450)
  })
})
