import type { Staff } from '@prisma/client'

/**
 * The staff record shape the guard attaches to the request: the raw `Staff` row plus the role
 * relation slice {@link hasPermission} needs. Distinct from {@link StaffEntity} (the flattened
 * public API response shape) on purpose — this one carries the nested role object a permission
 * check needs, not what a client should see.
 */
export type AuthenticatedStaff = Staff & {
  role: { name: string; builtIn: boolean }
}

/** Defines the admin auth request. */
export type AdminAuthRequest = {
  staff: AuthenticatedStaff
}
