import { describe, expect, it } from 'vitest'
import { genreEditorSchema } from './genre-editor.schema'

function values(
  overrides: Partial<Record<'name' | 'slug' | 'description' | 'color', string>> = {},
) {
  return { name: 'Synthwave', slug: '', description: '', color: '', ...overrides }
}

describe('genreEditorSchema', () => {
  it('accepts a name alone, leaving slug and colour blank', () => {
    expect(genreEditorSchema.safeParse(values()).success).toBe(true)
  })

  it('accepts an explicit slug and hex colour', () => {
    expect(
      genreEditorSchema.safeParse(values({ slug: 'drum-and-bass', color: '#1e3264' })).success,
    ).toBe(true)
  })

  it('rejects an empty name', () => {
    expect(genreEditorSchema.safeParse(values({ name: '  ' })).success).toBe(false)
  })

  it.each(['Drum Bass', 'a--b', '-a'])('rejects the slug %s', (slug) => {
    expect(genreEditorSchema.safeParse(values({ slug })).success).toBe(false)
  })

  it.each(['red', '#12345', '#1234567', '112233'])('rejects the colour %s', (color) => {
    const result = genreEditorSchema.safeParse(values({ color }))

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['color'])
  })
})
