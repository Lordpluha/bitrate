import { describe, expect, it } from 'vitest'
import { renderForChannel } from '../channels/render.js'
import { chunkKnowledgeDocument, parseHelpArticle } from '../knowledge/chunker.js'

/**
 * Inputs that make a backtracking regular expression take quadratic time (CodeQL
 * js/polynomial-redos). Help articles are repository files and answers are model output, so
 * neither is trusted to be well formed; parsing them must stay linear.
 */
const N = 50_000
const BUDGET_MS = 250

function elapsed(run: () => unknown): number {
  const start = performance.now()
  run()
  return performance.now() - start
}

const frontMatter = (extra: string) =>
  `---\ntitle: T\naudience: listener\nlocale: en\n${extra}\n---\n\nBody.`

describe('parsing stays linear on hostile input', () => {
  it.each([
    ['repeated [[ in the body', `${frontMatter('')}${'[['.repeat(N)}`],
    ['a list item padded with spaces', frontMatter(`sources:\n - ${' '.repeat(N)}x`)],
    ['a front-matter value padded with spaces', frontMatter(`A:${' '.repeat(N)}x`)],
    ['a heading padded with spaces', `${frontMatter('')}\n## ${' '.repeat(N)}x`],
    ['a heading made of #', `${frontMatter('')}\n## a${'#'.repeat(N)}b`],
    ['blank lines made of whitespace', `${frontMatter('')}\n${'\n \t'.repeat(N)}x`],
  ])('parseHelpArticle + chunk: %s', (_name, raw) => {
    const ms = elapsed(() => {
      try {
        chunkKnowledgeDocument(parseHelpArticle('listener/en/x.md', raw))
      } catch {
        // Rejecting the input is fine; only the time matters here.
      }
    })
    expect(ms).toBeLessThan(BUDGET_MS)
  })

  it.each([
    ['repeated [', '['.repeat(N)],
    ['a heading padded with spaces', `## ${' '.repeat(N)}x`],
    ['a heading made of #', `# a${'#'.repeat(N)}b`],
    ['indented lines', `${' '.repeat(N)}x`],
    ['whitespace-only lines', '\n \n'.repeat(N)],
  ])('renderForChannel: %s', (_name, text) => {
    for (const channel of ['telegram', 'whatsapp', 'instagram'] as const) {
      const ms = elapsed(() => renderForChannel({ text, citations: [] }, channel, 'en'))
      expect(ms).toBeLessThan(BUDGET_MS)
    }
  })
})

describe('hostile input is still parsed correctly', () => {
  it('keeps detecting a real placeholder after a run of [[', () => {
    const raw = `${frontMatter('')}${'[['.repeat(100)} [[DAYS]]`
    expect(() => parseHelpArticle('listener/en/x.md', raw)).toThrow(/placeholder/)
  })

  it('strips closing # from headings', () => {
    const chunks = chunkKnowledgeDocument({
      slug: 's',
      title: 'T',
      audience: 'all',
      locale: 'en',
      body: '## Section ##\n\nText.',
    })
    expect(chunks[0]?.text).toBe('T — Section\n\nText.')
  })
})
