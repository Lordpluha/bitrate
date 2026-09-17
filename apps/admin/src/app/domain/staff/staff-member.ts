import type { Permission } from '@domain/access'
import type { Sort } from '../shared/sort'

/**
 * The role assigned to an operator, embedded so the panel can compute divergence from
 * `StaffMember.permissions` without a second request — see `permissionDivergence`.
 */
export type StaffMemberRole = {
  id: string
  name: string
  /** The template's current permissions — may differ from `StaffMember.permissions`. */
  permissions: Permission[]
}

/**
 * An entry in the operator directory. Distinct from `Staff` (`./staff.ts`), which is the
 * signed-in operator's own session — this is any operator an administrator manages.
 *
 * Permissions live on the operator, not the role: a role is a template copied at assignment,
 * then edited independently from then on. An operator holding the built-in `ADMIN` role holds
 * every permission by identity and `permissions` is always `[]` for them — see
 * `canEditPermissions` and `permissionDivergence`.
 */
export type StaffMember = {
  id: string
  email: string
  username: string
  role: StaffMemberRole
  /** The permissions actually held by this operator. */
  permissions: Permission[]
  deactivatedAt: Date | null
  createdAt: Date
}

/** The columns the operator directory can be ordered by. */
export type StaffSortField = 'username' | 'email' | 'createdAt'

/**
 * No server-side text/status filter exists for the operator directory today — only pagination
 * and sorting — so this carries `sort` alone rather than staying the empty shape it used to be.
 */
export type StaffFilter = {
  sort?: Sort<StaffSortField>
}
