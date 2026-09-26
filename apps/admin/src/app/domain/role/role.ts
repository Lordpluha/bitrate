import type { Permission } from '@domain/access'

/** The reserved name of the built-in super-admin role — see `role-policy.ts`. */
export const BUILT_IN_ADMIN_ROLE_NAME = 'ADMIN'

/**
 * A role **template**. Assigning it to an operator copies its `permissions` onto that operator;
 * editing the template afterwards does not reach anyone already assigned it — see `holders` and
 * `divergentHolders`.
 */
export type Role = {
  id: string
  name: string
  description: string | null
  /** Whether this is a built-in role (`ADMIN` or `MODERATOR`) — see `role-policy.ts`. */
  builtIn: boolean
  /** The permissions this template grants when assigned. */
  permissions: Permission[]
  /** Active operators currently assigned this role. */
  holders: number
  /** Active holders whose own permission set no longer matches this template. */
  divergentHolders: number
  createdAt: Date
  updatedAt: Date
}
