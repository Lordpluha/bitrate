import { beforeEach, describe, expect, it } from '@jest/globals'
import { assertGrantable, MODERATOR_TEMPLATE } from '@modules/admin-auth'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { ensureBuiltInRoles } from './built-in-roles'

/** The persisted fields of a role row the in-memory table tracks. */
type StoredRole = {
  name: string
  description: string | null
  builtIn: boolean
  permissions: string[]
}

/**
 * Backs `role.upsert` with an in-memory table keyed by the unique `name`, applying `create` or
 * `update` the way Postgres would, so a spec can assert on the row a restart leaves behind.
 */
const fakeRoleTable = (prisma: PrismaMock, rows: StoredRole[]): Map<string, StoredRole> => {
  const table = new Map(rows.map((row) => [row.name, { ...row }]))

  prisma.role.upsert.mockImplementation(((args: Prisma.RoleUpsertArgs) => {
    const name = args.where.name as string
    const existing = table.get(name)
    const next = existing
      ? ({ ...existing, ...args.update } as StoredRole)
      : ({ description: null, ...args.create } as StoredRole)
    table.set(name, next)
    return Promise.resolve(next)
  }) as never)

  return table
}

describe('ensureBuiltInRoles', () => {
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
  })

  it('creates both built-in roles on an empty database, MODERATOR with its template', async () => {
    const table = fakeRoleTable(prisma, [])

    await ensureBuiltInRoles(prisma)

    expect(table.get('ADMIN')).toMatchObject({ builtIn: true, permissions: [] })
    expect(table.get('MODERATOR')).toMatchObject({
      builtIn: true,
      permissions: [...MODERATOR_TEMPLATE],
    })
    expect(() => assertGrantable(table.get('MODERATOR')?.permissions ?? [])).not.toThrow()
  })

  it('keeps permissions and description an administrator edited on an existing role', async () => {
    const edited: StoredRole = {
      name: 'MODERATOR',
      description: 'Handles reports only.',
      builtIn: true,
      permissions: ['reports:read', 'reports:advance'],
    }
    const table = fakeRoleTable(prisma, [edited])

    await ensureBuiltInRoles(prisma)

    expect(table.get('MODERATOR')).toEqual(edited)
  })

  it('never writes an operator-editable field in the update branch of either role', async () => {
    fakeRoleTable(prisma, [])

    await ensureBuiltInRoles(prisma)

    const calls = prisma.role.upsert.mock.calls.map(([args]) => args)
    expect(calls.map((args) => args.where)).toEqual([{ name: 'ADMIN' }, { name: 'MODERATOR' }])
    for (const args of calls) {
      expect(args.update).toEqual({ builtIn: true })
    }
  })

  it('restores the builtIn flag on a row that lost it, without touching its permissions', async () => {
    const table = fakeRoleTable(prisma, [
      { name: 'MODERATOR', description: null, builtIn: false, permissions: ['audit:read'] },
    ])

    await ensureBuiltInRoles(prisma)

    expect(table.get('MODERATOR')).toMatchObject({ builtIn: true, permissions: ['audit:read'] })
  })

  it('propagates a database failure instead of booting with a missing role', async () => {
    prisma.role.upsert.mockRejectedValueOnce(new Error('connection refused'))

    await expect(ensureBuiltInRoles(prisma)).rejects.toThrow('connection refused')
    expect(prisma.role.upsert).toHaveBeenCalledTimes(1)
  })
})
