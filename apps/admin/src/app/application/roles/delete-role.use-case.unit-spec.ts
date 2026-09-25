import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type CreateRoleInput,
  type PermissionCatalogueEntry,
  type Role,
  RoleRepository,
  RoleWriteError,
  type UpdateRoleInput,
} from '@domain/role'
import { ActionNotAllowedError } from '@domain/shared'
import { DeleteRoleUseCase } from './delete-role.use-case'

const remove = vi.fn<(id: string) => Promise<void>>()

class StubRoleRepository extends RoleRepository {
  override list(): Promise<Role[]> {
    throw new Error('not used')
  }

  override get(_id: string): Promise<Role> {
    throw new Error('not used')
  }

  override create(_input: CreateRoleInput): Promise<Role> {
    throw new Error('not used')
  }

  override update(_input: UpdateRoleInput): Promise<Role> {
    throw new Error('not used')
  }

  override delete(id: string): Promise<void> {
    return remove(id)
  }

  override listPermissionCatalogue(): Promise<PermissionCatalogueEntry[]> {
    throw new Error('not used')
  }
}

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    name: 'Catalog reviewer',
    description: null,
    builtIn: false,
    permissions: [],
    holders: 0,
    divergentHolders: 0,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

function create(): DeleteRoleUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: RoleRepository, useClass: StubRoleRepository }],
  })

  return TestBed.inject(DeleteRoleUseCase)
}

describe('DeleteRoleUseCase', () => {
  beforeEach(() => {
    remove.mockReset()
    remove.mockResolvedValue(undefined)
  })

  it('deletes a custom role with no holders', async () => {
    await create().execute(role())

    expect(remove).toHaveBeenCalledWith('3f2504e0-4f89-41d3-9a0c-0305e82c3301')
  })

  it('refuses a built-in role without calling the API', async () => {
    await expect(create().execute(role({ builtIn: true }))).rejects.toThrow(ActionNotAllowedError)
    expect(remove).not.toHaveBeenCalled()
  })

  it('refuses a role still in use without calling the API', async () => {
    await expect(create().execute(role({ holders: 2 }))).rejects.toThrow(ActionNotAllowedError)
    expect(remove).not.toHaveBeenCalled()
  })

  it('surfaces the repository rejection reason when the API refuses the delete', async () => {
    remove.mockRejectedValue(new RoleWriteError('in-use'))

    const error = await create()
      .execute(role())
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(RoleWriteError)
    expect((error as RoleWriteError).reason).toBe('in-use')
  })
})
