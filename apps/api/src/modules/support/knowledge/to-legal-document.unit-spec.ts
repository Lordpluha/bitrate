import { describe, expect, it } from '@jest/globals'
import { toLegalDocument } from './to-legal-document'

const privacy = `---
id: privacy-policy
title: Privacy Policy
draft: true
---

:::info[Published]
This is the published text. The apps hold their own copy; change all three together.
:::

**Effective date:** 1 October 2026.

## 1. Who is responsible

The controller is Bitrate.
`

describe('toLegalDocument', () => {
  it('turns an allowlisted legal text into a document for every audience, in English', () => {
    expect(toLegalDocument('privacy-policy.md', privacy)).toEqual({
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      audience: 'all',
      locale: 'en',
      url: 'https://bitrate.me/legal/privacy',
      body: '**Effective date:** 1 October 2026.\n\n## 1. Who is responsible\n\nThe controller is Bitrate.',
    })
  })

  it('drops internal admonitions, which are notes for maintainers, not policy', () => {
    expect(toLegalDocument('privacy-policy.md', privacy).body).not.toContain('apps hold')
  })

  it('rejects files outside the allowlist and texts without a title', () => {
    expect(() => toLegalDocument('complaints.md', privacy)).toThrow(/allowlist/)
    expect(() =>
      toLegalDocument('privacy-policy.md', privacy.replace('title: Privacy Policy\n', '')),
    ).toThrow(/title/)
  })
})
