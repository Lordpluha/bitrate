import type { Permission } from '@domain/access'
import type { Page, PageRequest } from '@domain/shared'
import type { StaffFilter, StaffMember } from './staff-member'

export type ListStaffQuery = PageRequest & { filter?: StaffFilter }

export type CreateStaffInput = {
  email: string
  username: string
  password: string
  roleId: string
  /** Sent only when the administrator adjusted the template's preview before saving. */
  permissions?: Permission[]
}

export type AssignStaffRoleInput = {
  id: string
  roleId: string
  permissions?: Permission[]
}

export type UpdateStaffPermissionsInput = {
  id: string
  permissions: Permission[]
}

/** The port the staff screens talk to. */
export abstract class StaffRepository {
  abstract list(query: ListStaffQuery): Promise<Page<StaffMember>>
  abstract get(id: string): Promise<StaffMember>
  abstract create(input: CreateStaffInput): Promise<StaffMember>
  abstract assignRole(input: AssignStaffRoleInput): Promise<StaffMember>
  abstract updatePermissions(input: UpdateStaffPermissionsInput): Promise<StaffMember>
  /** Deactivates and returns the updated operator — the API also revokes their sessions. */
  abstract deactivate(id: string): Promise<StaffMember>
}
