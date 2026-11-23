import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { readKnowledgeFiles } from './read-knowledge-files'

async function put(root: string, path: string, content: string) {
  await mkdir(dirname(join(root, path)), { recursive: true })
  await writeFile(join(root, path), content)
}

describe('readKnowledgeFiles', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'support-knowledge-'))
    await put(root, 'help/listener/en/delete-account.md', 'listener article')
    await put(root, 'help/all/uk/talk-to-a-person.md', 'shared article')
    await put(root, 'help/README.md', 'format notes, not an article')
    await put(root, 'help/_category_.json', '{}')
    await put(root, 'legal/privacy-policy.md', 'privacy')
    await put(root, 'legal/terms-of-use.md', 'terms')
    await put(root, 'legal/complaints.md', 'draft with [[PLACEHOLDERS]]')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('reads help articles and only the allowlisted legal texts, in a stable order', async () => {
    const files = await readKnowledgeFiles(root)

    expect(files).toEqual([
      { kind: 'help', path: 'all/uk/talk-to-a-person.md', raw: 'shared article' },
      { kind: 'help', path: 'listener/en/delete-account.md', raw: 'listener article' },
      { kind: 'legal', path: 'privacy-policy.md', raw: 'privacy' },
      { kind: 'legal', path: 'terms-of-use.md', raw: 'terms' },
    ])
  })

  it('returns nothing for a directory without knowledge sources', async () => {
    const empty = await mkdtemp(join(tmpdir(), 'support-knowledge-empty-'))
    try {
      expect(await readKnowledgeFiles(empty)).toEqual([])
    } finally {
      await rm(empty, { recursive: true, force: true })
    }
  })
})
