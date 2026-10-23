import * as z from 'zod'
import { PROTECTED_PERMISSIONS } from '@domain/access'
import type { Permission } from '@domain/access'

const PROTECTED_SET = new Set<Permission>(PROTECTED_PERMISSIONS)

/** The API's own floor, surfaced here as a validation message rather than only a server 400. */
export const MIN_PASSWORD_LENGTH = 12

/**
 * What the create form accepts. The permission grid already hides protected permissions, so
 * the `.refine` only ever fires against a value the UI could not itself have produced — still
 * worth stating, since a schema is the contract even when the widget in front of it behaves.
 */
export const staffCreateSchema = z.object({
  email: z.email('operator.invalid.email'),
  username: z.string().min(1, 'operator.invalid.usernameRequired'),
  password: z.string().min(MIN_PASSWORD_LENGTH, 'operator.invalid.passwordShort'),
  roleId: z.string().min(1, 'operator.invalid.roleRequired'),
  permissions: z
    .array(z.custom<Permission>())
    .refine((permissions) => permissions.every((permission) => !PROTECTED_SET.has(permission)), {
      message: 'operator.invalid.protected',
    }),
})
