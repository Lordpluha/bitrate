import { describe, expect, it } from 'vitest'
import { KnowledgeSourceError } from './knowledge-source-error.js'
import { parseHelpArticle } from './parse-help-article.js'

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
