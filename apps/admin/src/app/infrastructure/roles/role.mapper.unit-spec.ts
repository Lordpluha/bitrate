import { describe, expect, it } from 'vitest'
import { toPermissionCatalogueEntry, toRole } from './role.mapper'
import { roleDto, rolePermissionDto } from './role.dto'

describe('toRole', () => {
  it('parses a realistic role payload and converts its dates', () => {
    const dto = roleDto.parse({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      name: 'Catalog reviewer',
      description: 'Reviews the moderation queue',
      builtIn: false,
      permissions: ['reports:read', 'reports:advance'],
      holders: 4,
      divergentHolders: 1,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-05T09:00:00.000Z',
    })

    expect(toRole(dto)).toEqual({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      name: 'Catalog reviewer',
      description: 'Reviews the moderation queue',
      builtIn: false,
      permissions: ['reports:read', 'reports:advance'],
      holders: 4,
      divergentHolders: 1,
      createdAt: new Date('2026-09-01T09:00:00.000Z'),
      updatedAt: new Date('2026-09-05T09:00:00.000Z'),
    })
  })

  it('keeps a null description as null rather than an empty string', () => {
    const dto = roleDto.parse({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      name: 'ADMIN',
      description: null,
      builtIn: true,
      permissions: [],
      holders: 1,
      divergentHolders: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(toRole(dto).description).toBeNull()
  })
})

describe('toPermissionCatalogueEntry', () => {
  it('parses a catalogue entry, including an unheld one', () => {
    const dto = rolePermissionDto.parse({ id: 'staff:write', heldBy: 0, protected: true })

    expect(toPermissionCatalogueEntry(dto)).toEqual({
      permission: 'staff:write',
      heldBy: 0,
      protected: true,
    })
  })
})
