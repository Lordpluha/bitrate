import { describe, expect, it } from 'vitest'
import { roleEditorSchema } from './role-editor.schema'

function values(
  overrides: Partial<{ name: string; description: string; permissions: string[] }> = {},
) {
  return { name: 'Catalog reviewer', description: '', permissions: [], ...overrides }
}

describe('roleEditorSchema', () => {
  it('accepts a valid template', () => {
    const result = roleEditorSchema.safeParse(values({ permissions: ['tracks:read'] }))

    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = roleEditorSchema.safeParse(values({ name: '' }))

    expect(result.success).toBe(false)
  })

  it('rejects a protected permission in the template', () => {
    const result = roleEditorSchema.safeParse(values({ permissions: ['staff:write'] }))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['permissions'])
    }
  })
})
