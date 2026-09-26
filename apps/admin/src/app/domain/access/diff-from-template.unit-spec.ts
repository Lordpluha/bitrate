import { describe, expect, it } from 'vitest'
import { diffFromTemplate } from './diff-from-template'

describe('diffFromTemplate', () => {
  it('finds no diff when the sets are equal, regardless of order', () => {
    const result = diffFromTemplate({
      permissions: ['artists:read', 'reports:read'],
      template: ['reports:read', 'artists:read'],
    })

    expect(result).toEqual({ missing: [], extra: [] })
  })

  it('finds no diff when a duplicate is present', () => {
    const result = diffFromTemplate({
      permissions: ['reports:read', 'reports:read'],
      template: ['reports:read'],
    })

    expect(result).toEqual({ missing: [], extra: [] })
  })

  it('reports a permission the template grants but the operator does not hold', () => {
    const result = diffFromTemplate({
      permissions: [],
      template: ['reports:read'],
    })

    expect(result).toEqual({ missing: ['reports:read'], extra: [] })
  })

  it('reports a permission the operator holds but the template does not grant', () => {
    const result = diffFromTemplate({
      permissions: ['staff:write'],
      template: [],
    })

    expect(result).toEqual({ missing: [], extra: ['staff:write'] })
  })

  it('reports both a missing and an extra permission at once', () => {
    const result = diffFromTemplate({
      permissions: ['staff:write'],
      template: ['reports:read'],
    })

    expect(result).toEqual({ missing: ['reports:read'], extra: ['staff:write'] })
  })
})
