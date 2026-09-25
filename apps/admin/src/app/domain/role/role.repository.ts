import type { Permission } from '@domain/access'
import type { PermissionCatalogueEntry } from './permission-catalogue-entry'
import type { Role } from './role'

export type CreateRoleInput = {
  name: string
  description?: string
  permissions: Permission[]
}

export type UpdateRoleInput = {
  id: string
  /** Omitted for a built-in role — its name cannot be sent, not even unchanged. */
  name?: string
  description?: string | null
  permissions?: Permission[]
}

/** The port the roles screens talk to. */
export abstract class RoleRepository {
  abstract list(): Promise<Role[]>
  abstract get(id: string): Promise<Role>
  abstract create(input: CreateRoleInput): Promise<Role>
  abstract update(input: UpdateRoleInput): Promise<Role>
  abstract delete(id: string): Promise<void>
  abstract listPermissionCatalogue(): Promise<PermissionCatalogueEntry[]>
}
